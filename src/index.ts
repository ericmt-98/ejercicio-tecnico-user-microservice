import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { PrismaClient } from '@prisma/client';

class AppServer {
    private static instance: AppServer;
    public readonly app: express.Application;
    private prisma: PrismaClient = new PrismaClient();

    private constructor() {
        this.app = express();
        this.configureCors();
        this.configureMiddlewares();
        this.configureRestRoutes();
        this.configureGraphQL();
        this.configureSwagger();
    }

    public static getInstance(): AppServer {
        if (!AppServer.instance) {
            AppServer.instance = new AppServer();
        }
        return AppServer.instance;
    }

    private configureCors() {
        this.app.use(
            cors({
                origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
                    const allowedOrigins = ['http://example.com', 'https://example.com'];
                    if (!origin || allowedOrigins.includes(origin)) {
                        callback(null, true);
                    } else {
                        callback(new Error('No permitido por CORS'));
                    }
                },
                optionsSuccessStatus: 200,
            })
        );
    }

    private configureMiddlewares() {
        this.app.use(express.json());
    }

    private configureRestRoutes() {
        this.app.get('/users/:id', async (req, res) => {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const user = await this.prisma.user.findUnique({ where: { id } });
            if (user) {
                res.json({ id: user.id, name: user.name });
            } else {
                res.status(404).json({ error: 'Usuario no encontrado' });
            }
        });

        this.app.get('/users', async (req, res) => {
            const users = await this.prisma.user.findMany();
            res.json(users.map(u => ({ id: u.id, name: u.name })));
        });
    }

    private configureGraphQL() {
        const schema = buildSchema(`
      type User {
        id: Int!
        name: String!
      }

      type Query {
        user(id: Int!): User
        users: [User!]
      }
    `);

        const root = {
            user: ({ id }: { id: number }) => this.prisma.user.findUnique({ where: { id } }),
            users: () => this.prisma.user.findMany(),
        };

        this.app.use(
            '/graphql',
            graphqlHTTP({
                schema,
                rootValue: root,
                graphiql: true,
            })
        );
    }

    private configureSwagger() {
        const openApiSpec = {
            openapi: '3.0.3',
            info: {
                title: 'API de Usuarios',
                description: 'Microservicio REST + GraphQL con Prisma y SQLite',
                version: '1.0.0',
            },
            servers: [{ url: 'http://localhost:3000' }],
            paths: {
                '/users/{id}': {
                    get: {
                        summary: 'Obtener un usuario por ID',
                        parameters: [
                            {
                                name: 'id',
                                in: 'path',
                                required: true,
                                schema: { type: 'integer' },
                            },
                        ],
                        responses: {
                            '200': {
                                description: 'Usuario encontrado',
                                content: {
                                    'application/json': {
                                        schema: {
                                            $ref: '#/components/schemas/User',
                                        },
                                    },
                                },
                            },
                            '404': { description: 'Usuario no encontrado' },
                        },
                    },
                },
                '/users': {
                    get: {
                        summary: 'Obtener todos los usuarios',
                        responses: {
                            '200': {
                                description: 'Lista de usuarios',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/User' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                        },
                    },
                },
            },
        };

        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
    }

    public async start(port: number = 3000) {
        try {
            await this.prisma.$connect();
            this.app.listen(port, () => {
                console.log(`Servidor corriendo en http://localhost:${port}`);
                console.log(`Swagger: http://localhost:${port}/api-docs`);
                console.log(`GraphQL: http://localhost:${port}/graphql`);
            });
        } catch (err) {
            console.error('Error al iniciar:', err);
            process.exit(1);
        }
    }
}

(async () => {
    const server = AppServer.getInstance();
    await server.start(3000);
})();
