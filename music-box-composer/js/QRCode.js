/**
 * QRCode.js - Minimal QR code generator
 */

class QRCodeGenerator {
    static generate(text, size = 256) {
        const qr = QRCodeGenerator.createQRCode(text);
        const moduleCount = qr.length;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const padding = 4;
        const totalModules = moduleCount + (padding * 2);
        const moduleSize = size / totalModules;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';
        
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr[row][col]) {
                    ctx.fillRect((col + padding) * moduleSize, (row + padding) * moduleSize, moduleSize, moduleSize);
                }
            }
        }
        return canvas;
    }
    
    static createQRCode(text) {
        const version = 3;
        const size = 17 + version * 4; // 29x29
        const matrix = Array(size).fill(0).map(() => Array(size).fill(false));
        
        // Finder patterns
        QRCodeGenerator.addPattern(matrix, 0, 0, [
            [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]
        ]);
        QRCodeGenerator.addPattern(matrix, size - 7, 0, [
            [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]
        ]);
        QRCodeGenerator.addPattern(matrix, 0, size - 7, [
            [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]
        ]);
        
        // Timing patterns
        for (let i = 8; i < size - 8; i++) {
            matrix[6][i] = matrix[i][6] = (i % 2 === 0);
        }
        
        // Alignment pattern
        QRCodeGenerator.addPattern(matrix, 20, 20, [
            [1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]
        ], true);
        
        // Encode data
        QRCodeGenerator.encodeData(matrix, text, size);
        return matrix;
    }
    
    static addPattern(matrix, row, col, pattern, centered = false) {
        const offset = centered ? Math.floor(pattern.length / 2) : 0;
        for (let r = 0; r < pattern.length; r++) {
            for (let c = 0; c < pattern[r].length; c++) {
                const nr = row + r - offset;
                const nc = col + c - offset;
                if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix.length) {
                    matrix[nr][nc] = pattern[r][c] === 1;
                }
            }
        }
    }
    
    static encodeData(matrix, text, size) {
        const bits = [];
        bits.push(0, 1, 0, 0); // Mode indicator
        const length = Math.min(text.length, 255);
        for (let i = 7; i >= 0; i--) bits.push((length >> i) & 1);
        for (let i = 0; i < length; i++) {
            const charCode = text.charCodeAt(i);
            for (let j = 7; j >= 0; j--) bits.push((charCode >> j) & 1);
        }
        for (let i = 0; i < 4 && bits.length < 1000; i++) bits.push(0);
        
        let bitIndex = 0;
        for (let col = size - 1; col > 0; col -= 2) {
            if (col === 6) col--;
            for (let row = 0; row < size; row++) {
                const upward = Math.floor((size - 1 - col) / 2) % 2 === 0;
                const r = upward ? (size - 1 - row) : row;
                for (let c = 0; c < 2; c++) {
                    const currentCol = col - c;
                    if (!QRCodeGenerator.isReserved(r, currentCol, size)) {
                        matrix[r][currentCol] = bitIndex < bits.length ? bits[bitIndex++] : ((r + currentCol) % 2 === 0);
                    }
                }
            }
        }
    }
    
    static isReserved(row, col, size) {
        if ((row < 9 && col < 9) || (row < 9 && col >= size - 8) || (row >= size - 8 && col < 9)) return true;
        if (row === 6 || col === 6) return true;
        if (Math.abs(row - 20) <= 2 && Math.abs(col - 20) <= 2) return true;
        return false;
    }
}

