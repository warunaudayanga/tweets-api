// noinspection JSUnusedGlobalSymbols

export class SuccessResponse {
    constructor(
        public message: string = "Success",
        public code: string = "SUCCESS",
        public statusCode: number = 200,
    ) {}
}
