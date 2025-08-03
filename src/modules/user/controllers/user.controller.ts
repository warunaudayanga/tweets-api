import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { EntityId } from "@types";
import { UserService } from "../services";
import { Endpoint } from "../../../core/enums";
import { CreateUserDto, UpdateUserDto } from "../dtos";
import { User } from "../interfaces";
import { SuccessResponse } from "../../../core/responses";
import { JwtAuthGuard } from "../../auth/guards";
import { AuthService } from "../../auth/services";

@Controller(Endpoint.USER)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        const password = AuthService.generateHash(createUserDto.password);
        createUserDto.password = password;
        return this.userService.create({ ...createUserDto, password });
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    get(@Param("id") id: EntityId): Promise<User> {
        return this.userService.get(id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(): Promise<User[]> {
        return this.userService.getAll();
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    update(@Param("id") id: EntityId, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    delete(@Param("id") id: EntityId): Promise<SuccessResponse> {
        return this.userService.delete(id);
    }
}
