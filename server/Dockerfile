# Stage 1: build the API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY LoginApi/LoginApi.csproj LoginApi/
RUN dotnet restore LoginApi/LoginApi.csproj
COPY LoginApi/ LoginApi/
RUN dotnet publish LoginApi/LoginApi.csproj -c Release -o /app

# Stage 2: run the API
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "LoginApi.dll"]