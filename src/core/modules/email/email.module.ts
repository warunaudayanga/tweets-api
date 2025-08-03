import { Global, Module } from "@nestjs/common";
import { join } from "path";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { EmailService } from "./services";
import { configuration } from "@config";

@Global()
@Module({
    imports: [
        MailerModule.forRoot({
            transport: configuration().smtp,
            defaults: {
                from: `"eLMS" <${configuration().smtp.from}>`,
            },
            preview: true,
            template: {
                dir: join(__dirname, "templates/pages"),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
            options: {
                partials: {
                    dir: join(__dirname, "templates/partials"),
                    options: {
                        strict: true,
                    },
                },
            },
        }),
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
