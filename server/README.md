Backend Documentation

**GET /risk**
- Returns an object of important information for the homescreen.
	
*Result*

{
    risk: int,
    current: [
        Object {
            id: str,
            event: str,
            area: str,
            predictedRisk: int,
            adjustedRisk: int,
            eventWeight: int,
            rawScore: int,
            parameters: Object,
        },
    ]
    changes: [
        id: str,
        event: str,
        area: str,
        predictedRisk: int,
        adjustedRisk: int,
        eventWeight: int,
        rawScore: int,
        parameters: Object,
        _type: str,
    ]
}

*Possible Errors:*

Error Code: 500: The Server is Unreachable

==========================================================

**GET /in-depth-risk**

- Returns an in-depth risk score

*Result*

{
    baseAlertCount: int,
    severeWarningCount: int,
    rawNationalEnergy: int,
    densityModifierApplied: int,
    risk: int,
    breakdown: [
        {
            event: str,
            rawScore: int,
            decayApplied: int, (Expect 1.0 Consistently),
            actualContribution: int,
        },
    ],
    alerts: [
        {
            id: str,
            event: str,
            area: str,
            predictedRisk: int,
            adjustedRisk: int,
            eventWeight: int,
            rawScore: int,
            parameters: Object,
        }
    ]
}

*Possible Errors*

Error Code 500: The server is unreachable.

==========================================================

Wyatt Shroll -- 4/14/2026 at 11:44