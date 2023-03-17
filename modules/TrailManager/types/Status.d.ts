type Status = {
    UUID?: string,
    open?: boolean,
    danger?: string,
    createdOn?: Date,
    mtbStatus?: string | MTBStatus,
    conditions?: Conditions
}

type Conditions = {
    [index: string]: boolean,
    dry: boolean,
    mostlyDry: boolean,
    muddy: boolean,
    someMud: boolean,
    snowy: boolean,
    icy: boolean,
    fallenTrees: boolean
}