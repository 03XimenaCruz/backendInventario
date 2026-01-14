/*
 Navicat Premium Data Transfer

 Source Server         : inventario
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : inventario1

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 14/01/2026 15:06:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for almacen
-- ----------------------------
DROP TABLE IF EXISTS `almacen`;
CREATE TABLE `almacen`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ubicacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for categoria
-- ----------------------------
DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `warehouse_id` int NULL DEFAULT NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE,
  INDEX `warehouse_id`(`warehouse_id` ASC) USING BTREE,
  CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`warehouse_id`) REFERENCES `almacen` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for movimiento
-- ----------------------------
DROP TABLE IF EXISTS `movimiento`;
CREATE TABLE `movimiento`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_movimiento` enum('entrada','salida') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_id` int NOT NULL,
  `warehouse_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `stock_anterior` int NOT NULL,
  `stock_actual` int NOT NULL,
  `nota` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_movement_product`(`product_id` ASC) USING BTREE,
  INDEX `idx_movement_warehouse`(`warehouse_id` ASC) USING BTREE,
  INDEX `idx_movement_date`(`created_at` ASC) USING BTREE,
  INDEX `idx_movement_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `movimiento_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `producto` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `movimiento_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `almacen` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `movimiento_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 84 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for producto
-- ----------------------------
DROP TABLE IF EXISTS `producto`;
CREATE TABLE `producto`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `category_id` int NOT NULL,
  `warehouse_id` int NOT NULL,
  `stock` int NULL DEFAULT 0,
  `stock_minimo` int NOT NULL,
  `stock_maximo` int NOT NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `sku`(`sku` ASC) USING BTREE,
  INDEX `idx_product_warehouse`(`warehouse_id` ASC) USING BTREE,
  INDEX `idx_product_category`(`category_id` ASC) USING BTREE,
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categoria` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `almacen` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for usuario
-- ----------------------------
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `contrasenia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `rol` enum('administrador','colaborador') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'colaborador',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `correo`(`correo` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Procedure structure for sp_check_email_exists
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_check_email_exists`;
delimiter ;;
CREATE PROCEDURE `sp_check_email_exists`(IN p_correo VARCHAR(100),
    IN p_exclude_id INT)
BEGIN
    IF p_exclude_id IS NULL THEN
        SELECT COUNT(*) as count FROM usuario WHERE correo = p_correo;
    ELSE
        SELECT COUNT(*) as count FROM usuario WHERE correo = p_correo AND id != p_exclude_id;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_check_sku_exists
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_check_sku_exists`;
delimiter ;;
CREATE PROCEDURE `sp_check_sku_exists`(IN p_sku VARCHAR(50),
    IN p_exclude_id INT)
BEGIN
    IF p_exclude_id IS NULL THEN
        SELECT COUNT(*) as count FROM producto WHERE sku = p_sku;
    ELSE
        SELECT COUNT(*) as count FROM producto WHERE sku = p_sku AND id != p_exclude_id;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_count_low_stock_products
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_count_low_stock_products`;
delimiter ;;
CREATE PROCEDURE `sp_count_low_stock_products`()
BEGIN
    SELECT COUNT(*) as total FROM producto WHERE stock <= stock_minimo AND activo = 1;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_count_low_stock_products_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_count_low_stock_products_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_count_low_stock_products_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT COUNT(*) as total 
    FROM producto 
    WHERE stock <= stock_minimo 
      AND activo = 1
      AND (p_warehouse_id IS NULL OR warehouse_id = p_warehouse_id);
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_count_total_products
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_count_total_products`;
delimiter ;;
CREATE PROCEDURE `sp_count_total_products`()
BEGIN
    SELECT COUNT(*) as total FROM producto WHERE activo = 1;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_count_total_products_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_count_total_products_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_count_total_products_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT COUNT(*) as total 
    FROM producto 
    WHERE activo = 1
      AND (p_warehouse_id IS NULL OR warehouse_id = p_warehouse_id);
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_count_total_users
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_count_total_users`;
delimiter ;;
CREATE PROCEDURE `sp_count_total_users`()
BEGIN
    SELECT COUNT(*) as total FROM usuario;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_create_category
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_create_category`;
delimiter ;;
CREATE PROCEDURE `sp_create_category`(IN p_nombre VARCHAR(100), 
		IN p_warehouse_id INT)
BEGIN
    INSERT INTO categoria (nombre, warehouse_id) 
		VALUES (p_nombre, p_warehouse_id);
    SELECT LAST_INSERT_ID() as id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_create_movement
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_create_movement`;
delimiter ;;
CREATE PROCEDURE `sp_create_movement`(IN p_tipo_movimiento ENUM('entrada', 'salida'),
    IN p_product_id INT,
    IN p_warehouse_id INT,
    IN p_cantidad INT,
    IN p_stock_anterior INT,
    IN p_stock_actual INT,
    IN p_nota TEXT,
    IN p_user_id INT)
BEGIN
    INSERT INTO movimiento (tipo_movimiento, product_id, warehouse_id, cantidad, stock_anterior, stock_actual, nota, user_id)
    VALUES (p_tipo_movimiento, p_product_id, p_warehouse_id, p_cantidad, p_stock_anterior, p_stock_actual, p_nota, p_user_id);
    SELECT LAST_INSERT_ID() as id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_create_product
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_create_product`;
delimiter ;;
CREATE PROCEDURE `sp_create_product`(IN p_sku VARCHAR(50),
    IN p_nombre VARCHAR(200),
    IN p_category_id INT,
    IN p_warehouse_id INT,
    IN p_stock_minimo INT,
    IN p_stock_maximo INT)
BEGIN
    INSERT INTO producto (sku, nombre, category_id, warehouse_id, stock, stock_minimo, stock_maximo)
    VALUES (p_sku, p_nombre, p_category_id, p_warehouse_id, 0, p_stock_minimo, p_stock_maximo);
    SELECT LAST_INSERT_ID() as id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_create_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_create_user`;
delimiter ;;
CREATE PROCEDURE `sp_create_user`(IN p_nombre VARCHAR(100),
    IN p_correo VARCHAR(100),
    IN p_contrasenia VARCHAR(255),
    IN p_rol ENUM('administrador', 'colaborador'))
BEGIN
    INSERT INTO usuario (nombre, correo, contrasenia, rol) 
    VALUES (p_nombre, p_correo, p_contrasenia, p_rol);
    SELECT LAST_INSERT_ID() as id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_create_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_create_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_create_warehouse`(IN p_nombre VARCHAR(100),
    IN p_ubicacion VARCHAR(255))
BEGIN
    INSERT INTO almacen (nombre, ubicacion) VALUES (p_nombre, p_ubicacion);
    SELECT LAST_INSERT_ID() as id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_delete_category
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_delete_category`;
delimiter ;;
CREATE PROCEDURE `sp_delete_category`(IN p_id INT)
BEGIN
    UPDATE categoria SET activo = 0 WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_delete_product
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_delete_product`;
delimiter ;;
CREATE PROCEDURE `sp_delete_product`(IN p_id INT)
BEGIN
    UPDATE producto SET activo = 0 WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_delete_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_delete_user`;
delimiter ;;
CREATE PROCEDURE `sp_delete_user`(IN p_id INT)
BEGIN
    DELETE FROM usuario WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_delete_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_delete_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_delete_warehouse`(IN p_id INT)
BEGIN
    UPDATE almacen SET activo = 0 WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_all_categories
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_all_categories`;
delimiter ;;
CREATE PROCEDURE `sp_get_all_categories`()
BEGIN
    SELECT c.*, w.nombre as almacen 
		FROM categoria c
		LEFT JOIN almacen w ON c.warehouse_id = w.id
		WHERE c.activo = 1 
		ORDER BY w.nombre, c.nombre;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_all_movements
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_all_movements`;
delimiter ;;
CREATE PROCEDURE `sp_get_all_movements`()
BEGIN
    SELECT m.*, 
           p.nombre as producto, 
           w.nombre as almacen,
           u.nombre as usuario
    FROM movimiento m
    LEFT JOIN producto p ON m.product_id = p.id
    LEFT JOIN almacen w ON m.warehouse_id = w.id
    LEFT JOIN usuario u ON m.user_id = u.id
    ORDER BY m.created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_all_products
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_all_products`;
delimiter ;;
CREATE PROCEDURE `sp_get_all_products`()
BEGIN
    SELECT p.*, c.nombre as categoria, w.nombre as almacen 
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
		WHERE p.activo = 1
    ORDER BY p.created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_all_users
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_all_users`;
delimiter ;;
CREATE PROCEDURE `sp_get_all_users`()
BEGIN
    SELECT id, nombre, correo, rol, created_at FROM usuario ORDER BY created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_all_warehouses
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_all_warehouses`;
delimiter ;;
CREATE PROCEDURE `sp_get_all_warehouses`()
BEGIN
    SELECT * FROM almacen WHERE activo = 1 ORDER BY nombre;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_categories_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_categories_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_categories_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT c.*, w.nombre as almacen 
    FROM categoria c
    LEFT JOIN almacen w ON c.warehouse_id = w.id
    WHERE c.activo = 1 
    AND (c.warehouse_id = p_warehouse_id OR c.warehouse_id IS NULL)
    ORDER BY c.nombre;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_category_by_id
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_category_by_id`;
delimiter ;;
CREATE PROCEDURE `sp_get_category_by_id`(IN p_id INT)
BEGIN
    SELECT * FROM categoria WHERE id = p_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_excess_stock_alerts
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_excess_stock_alerts`;
delimiter ;;
CREATE PROCEDURE `sp_get_excess_stock_alerts`()
BEGIN
    SELECT 
        p.id,
        p.sku,
        p.nombre,
        c.nombre as categoria,
        w.nombre as almacen,
        p.stock,
        p.stock_maximo,
        (p.stock - p.stock_maximo) as exceso
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.activo = 1 AND p.stock >= p.stock_maximo
    ORDER BY (p.stock - p.stock_maximo) DESC, p.nombre ASC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_excess_stock_alerts_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_excess_stock_alerts_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_excess_stock_alerts_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT 
        p.id,
        p.sku,
        p.nombre,
        c.nombre as categoria,
        w.nombre as almacen,
        p.stock,
        p.stock_maximo,
        (p.stock - p.stock_maximo) as exceso
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.activo = 1 
      AND p.stock >= p.stock_maximo
      AND (p_warehouse_id IS NULL OR p.warehouse_id = p_warehouse_id)
    ORDER BY (p.stock - p.stock_maximo) DESC, p.nombre ASC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_inventory_report_by_month
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_inventory_report_by_month`;
delimiter ;;
CREATE PROCEDURE `sp_get_inventory_report_by_month`(IN p_year INT,
    IN p_month INT,
		IN p_warehouse_id INT)
BEGIN
    SELECT
				p.id,
        p.sku,
        p.nombre,
        c.nombre as categoria,
        w.nombre as almacen,
        p.stock,
        p.stock_minimo,
        p.stock_maximo,
        CASE 
            WHEN p.stock <= p.stock_minimo THEN 'Bajo'
            WHEN p.stock >= p.stock_maximo THEN 'Suficiente'
               ELSE 'Medio'
           END as status,
					 p.created_at as fecha_registro
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
		WHERE p.activo = 1
			AND (p_year IS NULL OR YEAR(p.created_at) = p_year)
      AND (p_month IS NULL OR MONTH(p.created_at) = p_month)
			AND (p_warehouse_id IS NULL OR p.warehouse_id = p_warehouse_id)
    ORDER BY w.nombre, c.nombre, p.nombre;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_low_exits_month
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_low_exits_month`;
delimiter ;;
CREATE PROCEDURE `sp_get_low_exits_month`()
BEGIN
  SELECT 
    p.id,
    p.nombre,
    p.sku,
    c.nombre AS categoria,
    w.nombre AS almacen,
    COALESCE(SUM(m.cantidad), 0) AS total_vendido
  FROM producto p

  LEFT JOIN movimiento m 
    ON m.product_id = p.id
    AND m.tipo_movimiento = 'salida'
    AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
    AND YEAR(m.created_at) = YEAR(CURRENT_DATE())

  LEFT JOIN (
    SELECT 
      p2.id
    FROM movimiento m2
    JOIN producto p2 ON p2.id = m2.product_id
    WHERE m2.tipo_movimiento = 'salida'
      AND MONTH(m2.created_at) = MONTH(CURRENT_DATE())
      AND YEAR(m2.created_at) = YEAR(CURRENT_DATE())
    GROUP BY p2.id
    ORDER BY SUM(m2.cantidad) DESC
    LIMIT 10
  ) top10 ON top10.id = p.id

  LEFT JOIN categoria c ON p.category_id = c.id
  LEFT JOIN almacen w ON p.warehouse_id = w.id

  WHERE p.activo = 1
    AND top10.id IS NULL

  GROUP BY p.id
  ORDER BY total_vendido ASC
  LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_low_exits_month_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_low_exits_month_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_low_exits_month_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT p.id, p.nombre, p.sku, c.nombre as categoria, w.nombre as almacen,
           COALESCE(SUM(m.cantidad), 0) as total_salidas,
           COUNT(m.id) as num_movimientos
    FROM producto p
    LEFT JOIN movimiento m ON p.id = m.product_id 
        AND m.tipo_movimiento = 'salida'
        AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
        AND YEAR(m.created_at) = YEAR(CURRENT_DATE())
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.activo = 1 AND p.warehouse_id = p_warehouse_id
    GROUP BY p.id
    ORDER BY total_salidas ASC
    LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_low_movements_month
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_low_movements_month`;
delimiter ;;
CREATE PROCEDURE `sp_get_low_movements_month`()
BEGIN
    SELECT 
        p.id, 
        p.nombre, 
        p.sku, 
        c.nombre as categoria, 
        w.nombre as almacen,
        COUNT(CASE WHEN m.tipo_movimiento = 'entrada' THEN 1 END) as total_entradas,
        COUNT(CASE WHEN m.tipo_movimiento = 'salida' THEN 1 END) as total_salidas,
        COUNT(m.id) as total_movimientos
    FROM producto p
    LEFT JOIN movimiento m ON p.id = m.product_id 
        AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
        AND YEAR(m.created_at) = YEAR(CURRENT_DATE())
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.activo = 1
    GROUP BY p.id, p.nombre, p.sku, c.nombre, w.nombre
    ORDER BY total_movimientos ASC, p.nombre ASC
    LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_low_stock_alerts
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_low_stock_alerts`;
delimiter ;;
CREATE PROCEDURE `sp_get_low_stock_alerts`()
BEGIN
    SELECT 
        p.id,
        p.sku,
        p.nombre,
        c.nombre as categoria,
        w.nombre as almacen,
        p.stock,
        p.stock_minimo,
        CASE 
            WHEN p.stock = 0 THEN 'Sin stock'
            WHEN p.stock <= p.stock_minimo THEN 'Stock crítico'
            ELSE 'Stock bajo'
        END as nivel_alerta
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.activo = 1 AND p.stock <= p.stock_minimo
    ORDER BY p.stock ASC, p.nombre ASC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_low_stock_alerts_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_low_stock_alerts_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_low_stock_alerts_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT 
        p.id,
        p.sku,
        p.nombre,
        c.nombre as categoria,
        w.nombre as almacen,
        p.stock,
        p.stock_minimo,
        CASE 
            WHEN p.stock = 0 THEN 'Sin stock'
            WHEN p.stock <= p.stock_minimo THEN 'Stock crítico'
            ELSE 'Stock bajo'
        END as nivel_alerta
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.activo = 1 
      AND p.stock <= p.stock_minimo
      AND (p_warehouse_id IS NULL OR p.warehouse_id = p_warehouse_id)
    ORDER BY p.stock ASC, p.nombre ASC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_low_stock_report
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_low_stock_report`;
delimiter ;;
CREATE PROCEDURE `sp_get_low_stock_report`(IN p_warehouse_id INT)
BEGIN
    SELECT p.*, c.nombre as categoria, w.nombre as almacen,
           'Bajo' as status
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.stock <= p.stock_minimo 
			AND p.activo = 1
			AND (p_warehouse_id IS NULL OR p.warehouse_id = p_warehouse_id)
    ORDER BY p.stock ASC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_movements_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_movements_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_movements_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT m.*, 
           p.nombre as producto, 
           w.nombre as almacen,
           u.nombre as usuario
    FROM movimiento m
    LEFT JOIN producto p ON m.product_id = p.id
    LEFT JOIN almacen w ON m.warehouse_id = w.id
    LEFT JOIN usuario u ON m.user_id = u.id
    WHERE m.warehouse_id = p_warehouse_id
    ORDER BY m.created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_movements_report_by_month
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_movements_report_by_month`;
delimiter ;;
CREATE PROCEDURE `sp_get_movements_report_by_month`(IN p_year INT,
    IN p_month INT,
		IN p_warehouse_id INT)
BEGIN
    SELECT 
        m.id,
        m.tipo_movimiento,
        p.nombre as producto,
        p.sku,
        w.nombre as almacen,
        m.cantidad,
        m.stock_anterior,
        m.stock_actual,
        m.nota,
        u.nombre as usuario,
        m.created_at as fecha
    FROM movimiento m
    LEFT JOIN producto p ON m.product_id = p.id
    LEFT JOIN almacen w ON m.warehouse_id = w.id
    LEFT JOIN usuario u ON m.user_id = u.id
    WHERE YEAR(m.created_at) = p_year
      AND MONTH(m.created_at) = p_month
			AND (p_warehouse_id IS NULL OR m.warehouse_id = p_warehouse_id)
    ORDER BY m.created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_movement_by_id
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_movement_by_id`;
delimiter ;;
CREATE PROCEDURE `sp_get_movement_by_id`(IN p_id INT)
BEGIN
    SELECT m.*, 
           p.nombre as producto, 
           w.nombre as almacen,
           u.nombre as usuario
    FROM movimiento m
    LEFT JOIN producto p ON m.product_id = p.id
    LEFT JOIN almacen w ON m.warehouse_id = w.id
    LEFT JOIN usuario u ON m.user_id = u.id
    WHERE m.id = p_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_products_by_category
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_products_by_category`;
delimiter ;;
CREATE PROCEDURE `sp_get_products_by_category`(IN p_category_id INT)
BEGIN
    SELECT p.*, c.nombre as categoria, w.nombre as almacen 
    FROM producto p
    JOIN categoria c ON p.category_id = c.id
    JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.category_id = p_category_id AND p.activo = 1
    ORDER BY p.created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_products_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_products_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_products_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT p.*, c.nombre as categoria, w.nombre as almacen 
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.warehouse_id = p_warehouse_id AND p.activo = 1
    ORDER BY p.created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_product_by_id
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_product_by_id`;
delimiter ;;
CREATE PROCEDURE `sp_get_product_by_id`(IN p_id INT)
BEGIN
    SELECT p.*, c.nombre as categoria, w.nombre as almacen 
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.id = p_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_top_entries_month
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_top_entries_month`;
delimiter ;;
CREATE PROCEDURE `sp_get_top_entries_month`()
BEGIN
    SELECT p.id, p.nombre, p.sku, c.nombre as categoria, w.nombre as almacen, 
           SUM(m.cantidad) as total_entradas,
					 COUNT(m.id) as num_movimientos
    FROM movimiento m
    JOIN producto p ON m.product_id = p.id
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE m.tipo_movimiento = 'entrada' 
			AND p.activo = 1
			AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
      AND YEAR(m.created_at) = YEAR(CURRENT_DATE())
    GROUP BY p.id
    ORDER BY total_entradas DESC
    LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_top_entries_month_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_top_entries_month_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_top_entries_month_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT p.id, p.nombre, p.sku, c.nombre as categoria, w.nombre as almacen, 
           SUM(m.cantidad) as total_entradas,
           COUNT(m.id) as num_movimientos
    FROM movimiento m
    JOIN producto p ON m.product_id = p.id
    LEFT JOIN categori c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE m.tipo_movimiento = 'entrada' 
      AND p.activo = 1
      AND m.warehouse_id = p_warehouse_id
      AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
      AND YEAR(m.created_at) = YEAR(CURRENT_DATE())
    GROUP BY p.id
    ORDER BY total_entradas DESC
    LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_top_exits_month
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_top_exits_month`;
delimiter ;;
CREATE PROCEDURE `sp_get_top_exits_month`()
BEGIN
  SELECT 
    p.id,
    p.nombre,
    p.sku,
    c.nombre AS categoria,
    w.nombre AS almacen,
    SUM(m.cantidad) AS total_vendido
  FROM movimiento m
  JOIN producto p ON m.product_id = p.id
  LEFT JOIN categoria c ON p.category_id = c.id
  LEFT JOIN almacen w ON p.warehouse_id = w.id
  WHERE m.tipo_movimiento = 'salida'
    AND p.activo = 1
    AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
    AND YEAR(m.created_at) = YEAR(CURRENT_DATE())
  GROUP BY p.id
  ORDER BY total_vendido DESC
  LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_top_exits_month_by_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_top_exits_month_by_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_get_top_exits_month_by_warehouse`(IN p_warehouse_id INT)
BEGIN
    SELECT 
        p.id,
        p.nombre,
        p.sku,
        c.nombre AS categoria,
        w.nombre AS almacen,
        SUM(m.cantidad) AS total_vendido
    FROM movimiento m
    JOIN producto p ON m.product_id = p.id
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE m.tipo_movimiento = 'salida'
        AND p.activo = 1
        AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
        AND YEAR(m.created_at) = YEAR(CURRENT_DATE())
        AND (p_warehouse_id IS NULL OR p.warehouse_id = p_warehouse_id)
    GROUP BY p.id
    ORDER BY total_vendido DESC
    LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_top_movements_month
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_top_movements_month`;
delimiter ;;
CREATE PROCEDURE `sp_get_top_movements_month`()
BEGIN
    SELECT 
        p.id, 
        p.nombre, 
        p.sku, 
        c.nombre as categoria, 
        w.nombre as almacen,
        COUNT(CASE WHEN m.tipo_movimiento = 'entrada' THEN 1 END) as total_entradas,
        COUNT(CASE WHEN m.tipo_movimiento = 'salida' THEN 1 END) as total_salidas,
        COUNT(m.id) as total_movimientos
    FROM movimiento m
    JOIN producto p ON m.product_id = p.id
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.activo = 1
        AND MONTH(m.created_at) = MONTH(CURRENT_DATE())
        AND YEAR(m.created_at) = YEAR(CURRENT_DATE())
    GROUP BY p.id, p.nombre, p.sku, c.nombre, w.nombre
    ORDER BY total_movimientos DESC
    LIMIT 10;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_user_by_email
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_user_by_email`;
delimiter ;;
CREATE PROCEDURE `sp_get_user_by_email`(IN p_correo VARCHAR(100))
BEGIN
    SELECT * FROM usuario WHERE correo = p_correo;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_user_by_id
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_user_by_id`;
delimiter ;;
CREATE PROCEDURE `sp_get_user_by_id`(IN p_id INT)
BEGIN
    SELECT id, nombre, correo, rol, created_at FROM usuario WHERE id = p_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_warehouse_by_id
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_warehouse_by_id`;
delimiter ;;
CREATE PROCEDURE `sp_get_warehouse_by_id`(IN p_id INT)
BEGIN
    SELECT * FROM almacen WHERE id = p_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_search_products_by_name
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_search_products_by_name`;
delimiter ;;
CREATE PROCEDURE `sp_search_products_by_name`(IN p_search VARCHAR(200))
BEGIN
    SELECT p.*, c.nombre as categoria, w.nombre as almacen 
    FROM producto p
    LEFT JOIN categoria c ON p.category_id = c.id
    LEFT JOIN almacen w ON p.warehouse_id = w.id
    WHERE p.nombre LIKE CONCAT('%', p_search, '%') AND p.activo = 1
    ORDER BY p.created_at DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_category
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_category`;
delimiter ;;
CREATE PROCEDURE `sp_update_category`(IN p_id INT,
    IN p_nombre VARCHAR(100),
		IN p_warehouse_id INT)
BEGIN
    UPDATE categoria 
		SET nombre = p_nombre, warehouse_id = p_warehouse_id
		WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_product
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_product`;
delimiter ;;
CREATE PROCEDURE `sp_update_product`(IN p_id INT,
    IN p_sku VARCHAR(50),
    IN p_nombre VARCHAR(200),
    IN p_category_id INT,
    IN p_warehouse_id INT,
    IN p_stock_minimo INT,
    IN p_stock_maximo INT)
BEGIN
    UPDATE producto
    SET sku = p_sku, nombre = p_nombre, category_id = p_category_id, 
        warehouse_id = p_warehouse_id, stock_minimo = p_stock_minimo, stock_maximo = p_stock_maximo
    WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_product_stock
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_product_stock`;
delimiter ;;
CREATE PROCEDURE `sp_update_product_stock`(IN p_id INT,
    IN p_stock INT)
BEGIN
    UPDATE producto SET stock = p_stock WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_user_without_password
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_user_without_password`;
delimiter ;;
CREATE PROCEDURE `sp_update_user_without_password`(IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_correo VARCHAR(100),
    IN p_rol ENUM('administrador', 'colaborador'))
BEGIN
    UPDATE usuario 
    SET nombre = p_nombre, correo = p_correo, rol = p_rol
    WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_user_with_password
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_user_with_password`;
delimiter ;;
CREATE PROCEDURE `sp_update_user_with_password`(IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_correo VARCHAR(100),
    IN p_contrasenia VARCHAR(255),
    IN p_rol ENUM('administrador', 'colaborador'))
BEGIN
    UPDATE usuario
    SET nombre = p_nombre, correo = p_correo, contrasenia = p_contrasenia, rol = p_rol
    WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_warehouse
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_warehouse`;
delimiter ;;
CREATE PROCEDURE `sp_update_warehouse`(IN p_id INT,
    IN p_nombre VARCHAR(100),
    IN p_ubicacion VARCHAR(255))
BEGIN
    UPDATE almacen SET nombre = p_nombre, ubicacion = p_ubicacion WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
