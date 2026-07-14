import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783979639835 implements MigrationInterface {
  name = 'InitialSchema1783979639835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "host" varchar(255) NOT NULL,
        "protocol" varchar(10) NOT NULL CHECK ("protocol" IN ('ICMP', 'TCP')),
        "port" integer CHECK ("port" IS NULL OR ("port" >= 1 AND "port" <= 65535)),
        "is_active" boolean NOT NULL DEFAULT true,
        "last_check" timestamptz,
        "last_status" varchar(10) CHECK ("last_status" IS NULL OR "last_status" IN ('UP', 'DOWN', 'INACTIVE')),
        "last_latency" integer,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uniq_devices_host_protocol_port" UNIQUE ("host", "protocol", "port"),
        CONSTRAINT "PK_devices" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_devices_is_active" ON "devices" ("is_active")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_devices_host" ON "devices" ("host")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_devices_protocol" ON "devices" ("protocol")`,
    );

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE TRIGGER update_devices_updated_at
        BEFORE UPDATE ON devices
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await queryRunner.query(`
      CREATE TABLE "monitoring_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" uuid NOT NULL,
        "status" varchar(10) NOT NULL CHECK ("status" IN ('UP', 'DOWN')),
        "latency" integer,
        "error_message" text,
        "timestamp" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_monitoring_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_monitoring_logs_device" FOREIGN KEY ("device_id")
          REFERENCES "devices" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_monitoring_logs_device_id_timestamp" ON "monitoring_logs" ("device_id", "timestamp" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_monitoring_logs_timestamp" ON "monitoring_logs" ("timestamp" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_monitoring_logs_status" ON "monitoring_logs" ("status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "incidents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "device_id" uuid NOT NULL,
        "started_at" timestamptz NOT NULL,
        "resolved_at" timestamptz,
        "duration" integer,
        CONSTRAINT "PK_incidents" PRIMARY KEY ("id"),
        CONSTRAINT "FK_incidents_device" FOREIGN KEY ("device_id")
          REFERENCES "devices" ("id") ON DELETE CASCADE,
        CONSTRAINT "chk_resolved_after_started"
          CHECK ("resolved_at" IS NULL OR "resolved_at" >= "started_at")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_incidents_device_id_started_at" ON "incidents" ("device_id", "started_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_incidents_resolved_at" ON "incidents" ("resolved_at") WHERE "resolved_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_incidents_ongoing" ON "incidents" ("device_id") WHERE "resolved_at" IS NULL`,
    );

    await queryRunner.query(`
      CREATE TABLE "settings" (
        "key" varchar(255) NOT NULL,
        "value" varchar(255) NOT NULL,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settings" PRIMARY KEY ("key")
      )
    `);
    await queryRunner.query(`
      CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    await queryRunner.query(`
      INSERT INTO settings (key, value) VALUES
        ('monitoring_interval_seconds', '60'),
        ('monitoring_timeout_seconds', '3'),
        ('max_concurrent_checks', '20'),
        ('log_retention_days', '30'),
        ('incident_retention_days', '365')
      ON CONFLICT (key) DO NOTHING
    `);

    // Optional helper invoked by administrative/SQL tooling; application
    // logic performs this same up/down transition in TypeScript (see
    // MonitoringService.handleStatusChange).
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION handle_device_status_change(
        p_device_id UUID,
        p_new_status VARCHAR(10),
        p_check_timestamp TIMESTAMP WITH TIME ZONE
      ) RETURNS VOID AS $$
      BEGIN
        IF p_new_status = 'DOWN' THEN
          INSERT INTO incidents (device_id, started_at)
          SELECT p_device_id, p_check_timestamp
          WHERE NOT EXISTS (
            SELECT 1 FROM incidents
            WHERE device_id = p_device_id AND resolved_at IS NULL
          );
        ELSIF p_new_status = 'UP' THEN
          UPDATE incidents
          SET resolved_at = p_check_timestamp,
              duration = EXTRACT(EPOCH FROM (p_check_timestamp - started_at))::INTEGER
          WHERE device_id = p_device_id
            AND resolved_at IS NULL;
        END IF;
      END;
      $$ LANGUAGE plpgsql
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS handle_device_status_change(UUID, VARCHAR, TIMESTAMP WITH TIME ZONE)`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "incidents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "monitoring_logs"`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_devices_updated_at ON "devices"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "devices"`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );
  }
}
