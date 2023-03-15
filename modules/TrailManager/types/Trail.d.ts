type Trail = {
    UUID?: string,
    mtbID?: string,
    name?: string,
    city?: string,
    state?: string | State,
    centerLatitude?: number,
    centerLongitude?: number,
    lastUpdate?: Date,
    weather?: string | Weather,
    status?: string | Status
}