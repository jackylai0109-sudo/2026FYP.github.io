class ChatMessage {
    constructor(id, senderId, senderName, timestamp, content) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.timestamp = timestamp || new Date();
        this.content = content || new MContent('', 'text');
    }

    toMap() {
        const map = {
            id: this.id,
            senderId: this.senderId,
            senderName: this.senderName,
            timestamp: this.timestamp || FieldValue.serverTimestamp(),
            ...this.content.toMap()
        };
        return map;
    }

    static fromMap(data) {
        const id = data.id;
        const senderId = data.senderId;
        const senderName = data.senderName;
        const timestamp = data.timestamp;
        const content = MContent.fromMap(data);
        return new ChatMessage(id, senderId, senderName, timestamp, content);
    }

    toString() {
        if (!this.timestamp) return '[unknown time]';
        
        const date = this.timestamp instanceof Date ? 
            this.timestamp : this.timestamp.toDate();
        
        const formatter = new Intl.DateTimeFormat('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        const timeStr = formatter.format(date);
        
        return `[${this.senderId} @ ${timeStr}]\n${this.content.getPreview()}`;
    }

    getFormattedTime() {
        if (!this.timestamp) return '';
        
        const date = this.timestamp instanceof Date ? 
            this.timestamp : this.timestamp.toDate();
        
        return date.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getFullDateTime() {
        if (!this.timestamp) return '';
        
        const date = this.timestamp instanceof Date ? 
            this.timestamp : this.timestamp.toDate();
        
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

class MContent {
    constructor(text, type = 'text', metadata = {}) {
        this.text = text;
        this.type = type;
        this.metadata = metadata;
    }

    toMap() {
        return {
            text: this.text,
            type: this.type,
            metadata: this.metadata
        };
    }

    static fromMap(data) {
        const text = data.text || '';
        const type = data.type || 'text';
        const metadata = data.metadata || {};
        return new MContent(text, type, metadata);
    }

    getPreview() {
        switch(this.type) {
            case 'image':
                return '📷 [圖片] ' + (this.metadata.caption || '');
            case 'location':
                return '📍 [位置] ' + (this.metadata.address || '');
            case 'file':
                return '📎 [檔案] ' + (this.metadata.filename || '');
            default:
                return this.text || '[空白訊息]';
        }
    }

    isImage() { return this.type === 'image'; }
    isLocation() { return this.type === 'location'; }
    isFile() { return this.type === 'file'; }
    isText() { return this.type === 'text'; }
}