/**
 * QRCode.js - QR code generator using external API
 * Using qrserver.com API since implementing a full QR code encoder is complex
 */

class QRCodeGenerator {
    /**
     * Generate a QR code for the given text
     * @param {string} text - The text to encode
     * @param {number} size - The size of the QR code image
     * @returns {HTMLCanvasElement} Canvas element with the QR code
     */
    static generate(text, size = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Create QR code using API
        const encodedText = encodeURIComponent(text);
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
        
        // Draw a placeholder while loading
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#333';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Generating QR code...', size/2, size/2);
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
        };
        
        img.onerror = () => {
            ctx.fillStyle = '#ffebee';
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = '#c62828';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('QR code generation failed', size/2, size/2 - 10);
            ctx.fillText('Try downloading the image', size/2, size/2 + 10);
        };
        
        img.src = apiUrl;
        
        return canvas;
    }
}

window.QRCodeGenerator = QRCodeGenerator;

