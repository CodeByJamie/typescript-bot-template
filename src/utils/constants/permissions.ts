
/**
 * Custom Permission Flags
 * @description 1 in binary = 0000 0001
 * @description Take the binary 1 and shift it x spaces to the left
 * 
 * @example 1 << 1:
 * "0000 0001" becomes "0000 0010" (2 decimal)
 * 
 * Or you can use Mathematics instead:
 * 
 * @example Formula: (x << y = x * y^2)
 * 1 << 2 = (1 * 2^2 = 4)
 */

export const permissionFlags = {
    MANAGE_CONFIG: 1 << 2,
}