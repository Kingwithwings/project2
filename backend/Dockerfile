# ---------------------------------------------------
# Stage 1: Build the JAR with Maven
# ---------------------------------------------------
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first to cache dependencies
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Convert line endings (safe for Windows checkouts) and grant execution permission
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Download dependencies in an isolated layer for fast rebuild caching
RUN ./mvnw dependency:go-offline -B

# Copy project source code
COPY src ./src

# Compile and package application (skipping tests for deployment speed)
RUN ./mvnw clean package -DskipTests

# ---------------------------------------------------
# Stage 2: Minimal Production Runtime
# ---------------------------------------------------
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Create a non-root system user for container security
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Copy built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Render assigns a dynamic port via the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Configure memory limits suitable for free/starter cloud tiers (512MB RAM)
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -jar app.jar"]