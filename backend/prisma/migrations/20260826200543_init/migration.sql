-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `apellido` VARCHAR(80) NOT NULL,
    `cedula` VARCHAR(15) NULL,
    `telefono` VARCHAR(20) NULL,
    `direccion` VARCHAR(160) NULL,
    `barrio` VARCHAR(80) NULL,
    `ciudad` VARCHAR(80) NULL,
    `departamento` VARCHAR(80) NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `email` VARCHAR(120) NOT NULL,
    `passwordHash` VARCHAR(255) NULL,
    `googleId` VARCHAR(191) NULL,
    `authProvider` ENUM('LOCAL', 'GOOGLE') NOT NULL DEFAULT 'LOCAL',
    `role` ENUM('CLIENTE', 'ADMIN') NOT NULL DEFAULT 'CLIENTE',
    `estado` ENUM('ACTIVO', 'SUSPENDIDO', 'PENDIENTE_VERIFICACION') NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    `emailVerifiedAt` DATETIME(3) NULL,
    `acceptedTermsAt` DATETIME(3) NULL,
    `acceptedPrivacyAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_cedula_key`(`cedula`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_googleId_key`(`googleId`),
    INDEX `User_estado_idx`(`estado`),
    INDEX `User_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_expiresAt_idx`(`userId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `imagen` VARCHAR(500) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_nombre_key`(`nombre`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_activo_orden_idx`(`activo`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Occasion` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Occasion_nombre_key`(`nombre`),
    UNIQUE INDEX `Occasion_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoryOccasion` (
    `categoryId` VARCHAR(191) NOT NULL,
    `occasionId` VARCHAR(191) NOT NULL,

    INDEX `CategoryOccasion_occasionId_idx`(`occasionId`),
    PRIMARY KEY (`categoryId`, `occasionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `precio` DECIMAL(12, 2) NOT NULL,
    `precioAnterior` DECIMAL(12, 2) NULL,
    `costo` DECIMAL(12, 2) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `stockMinimo` INTEGER NOT NULL DEFAULT 0,
    `imagen` VARCHAR(500) NOT NULL,
    `imagenAlt` VARCHAR(180) NULL,
    `tiempoEntrega` VARCHAR(100) NOT NULL,
    `pesoGramos` INTEGER NULL,
    `permitirPersonalizacion` BOOLEAN NOT NULL DEFAULT false,
    `opcionesPersonalizacion` JSON NULL,
    `destacado` BOOLEAN NOT NULL DEFAULT false,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `categoryId` VARCHAR(191) NOT NULL,
    `occasionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_sku_key`(`sku`),
    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_categoryId_activo_idx`(`categoryId`, `activo`),
    INDEX `Product_occasionId_idx`(`occasionId`),
    INDEX `Product_destacado_activo_idx`(`destacado`, `activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(180) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_orden_idx`(`productId`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `numeroPedido` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `metodoEntrega` ENUM('DOMICILIO', 'TIENDA') NOT NULL,
    `nombreContacto` VARCHAR(160) NOT NULL,
    `cedulaContacto` VARCHAR(15) NULL,
    `emailContacto` VARCHAR(120) NOT NULL,
    `telefonoContacto` VARCHAR(20) NOT NULL,
    `direccionEntrega` VARCHAR(160) NULL,
    `barrioEntrega` VARCHAR(80) NULL,
    `ciudadEntrega` VARCHAR(80) NULL,
    `departamentoEntrega` VARCHAR(80) NULL,
    `notasEntrega` VARCHAR(500) NULL,
    `direccionRecogida` VARCHAR(160) NULL,
    `fechaRecogida` DATETIME(3) NULL,
    `horaRecogida` VARCHAR(10) NULL,
    `costoEnvio` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `descuento` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `fechaEstimadaEntrega` DATETIME(3) NULL,
    `enlaceRastreo` VARCHAR(500) NULL,
    `motivoCancelacion` VARCHAR(500) NULL,
    `canceladoAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_numeroPedido_key`(`numeroPedido`),
    INDEX `Order_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Order_estado_createdAt_idx`(`estado`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `nombreProducto` VARCHAR(150) NOT NULL,
    `imagenProducto` VARCHAR(500) NULL,
    `cantidad` INTEGER NOT NULL,
    `precioUnitario` DECIMAL(12, 2) NOT NULL,
    `descuentoUnitario` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `personalizacion` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `metodo` ENUM('NEQUI', 'DAVIPLATA', 'PSE', 'TRANSFERENCIA_BANCARIA') NOT NULL,
    `estado` ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO') NOT NULL DEFAULT 'PENDIENTE',
    `monto` DECIMAL(12, 2) NOT NULL,
    `referencia` VARCHAR(120) NULL,
    `proveedorTransaccion` VARCHAR(120) NULL,
    `respuestaPasarela` JSON NULL,
    `pagadoAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_referencia_key`(`referencia`),
    INDEX `Payment_orderId_estado_idx`(`orderId`, `estado`),
    INDEX `Payment_estado_createdAt_idx`(`estado`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `evento` VARCHAR(120) NOT NULL,
    `detalles` TEXT NOT NULL,
    `ip` VARCHAR(45) NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `AuditLog_evento_createdAt_idx`(`evento`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryOccasion` ADD CONSTRAINT `CategoryOccasion_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryOccasion` ADD CONSTRAINT `CategoryOccasion_occasionId_fkey` FOREIGN KEY (`occasionId`) REFERENCES `Occasion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_occasionId_fkey` FOREIGN KEY (`occasionId`) REFERENCES `Occasion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
