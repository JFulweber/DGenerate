export class UnparsedConditions{
    key: string;
    value: any;
}

export class UnparsedVariableJson{
    type: string;
    dependents?:string[];
    values?: UnparsedConditions[];
}