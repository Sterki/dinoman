<?php

declare(strict_types=1);

namespace App\Application;

final class CarbsCalculatorService
{
    public function calculate(float $carbsPer100g, float $gramsConsumed): float
    {
        return round(($carbsPer100g / 100) * $gramsConsumed, 2);
    }
}
