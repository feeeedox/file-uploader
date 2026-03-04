# Build Stage
FROM oven/bun:1-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma

# Generate prisma client
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Production Stage
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Start the application
CMD ["bun", ".output/server/index.mjs"]
