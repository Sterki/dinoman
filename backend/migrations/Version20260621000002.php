<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260621000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add users table and user_id FK to patients and foods';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE users (
                id UUID NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                api_token VARCHAR(64) NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        SQL);

        $this->addSql('CREATE UNIQUE INDEX uniq_users_email ON users (email)');
        $this->addSql('CREATE UNIQUE INDEX uniq_users_api_token ON users (api_token)');

        $this->addSql('ALTER TABLE patients ADD COLUMN user_id UUID DEFAULT NULL');
        $this->addSql(<<<'SQL'
            ALTER TABLE patients
                ADD CONSTRAINT fk_patients_user
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql('CREATE INDEX idx_patients_user_id ON patients (user_id)');

        $this->addSql('ALTER TABLE foods ADD COLUMN user_id UUID DEFAULT NULL');
        $this->addSql(<<<'SQL'
            ALTER TABLE foods
                ADD CONSTRAINT fk_foods_user
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql('CREATE INDEX idx_foods_user_id ON foods (user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE foods DROP CONSTRAINT fk_foods_user');
        $this->addSql('ALTER TABLE foods DROP COLUMN user_id');
        $this->addSql('ALTER TABLE patients DROP CONSTRAINT fk_patients_user');
        $this->addSql('ALTER TABLE patients DROP COLUMN user_id');
        $this->addSql('DROP TABLE users');
    }
}
