export function toDateOnly(value: string) {
    return new Date(`${value}T00:00:00`);
}

export function toTime(value: string) {
    return new Date(`1970-01-01T${value}:00`);
}