<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260621000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create initial tables: patients, foods, meals, meal_foods';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE EXTENSION IF NOT EXISTS "pgcrypto"
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE patients (
                id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                birth_date DATE DEFAULT NULL,
                photo VARCHAR(500) DEFAULT NULL,
                daily_carb_goal NUMERIC(8, 2) DEFAULT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE foods (
                id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                carbs_per_100g NUMERIC(8, 2) NOT NULL,
                photo VARCHAR(500) DEFAULT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX idx_foods_name ON foods (name)
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE meals (
                id UUID NOT NULL,
                patient_id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                eaten_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                photo VARCHAR(500) DEFAULT NULL,
                notes TEXT DEFAULT NULL,
                total_carbs NUMERIC(8, 2) NOT NULL DEFAULT 0,
                is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id),
                CONSTRAINT fk_meals_patient FOREIGN KEY (patient_id)
                    REFERENCES patients (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
            )
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX idx_meals_patient_id ON meals (patient_id)
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX idx_meals_eaten_at ON meals (eaten_at)
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE meal_foods (
                id UUID NOT NULL,
                meal_id UUID NOT NULL,
                food_id UUID NOT NULL,
                grams_consumed NUMERIC(8, 2) NOT NULL,
                carbs_calculated NUMERIC(8, 2) NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id),
                CONSTRAINT fk_meal_foods_meal FOREIGN KEY (meal_id)
                    REFERENCES meals (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE,
                CONSTRAINT fk_meal_foods_food FOREIGN KEY (food_id)
                    REFERENCES foods (id) ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE
            )
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX idx_meal_foods_meal_id ON meal_foods (meal_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE meal_foods');
        $this->addSql('DROP TABLE meals');
        $this->addSql('DROP TABLE foods');
        $this->addSql('DROP TABLE patients');
    }
}
