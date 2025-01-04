class CommentSystem {
    constructor() {
        this.form = document.getElementById('comment-form');
        this.container = document.getElementById('comments-container');
        // Define moderation labels
        this.labels = {
            pending: 'comment:pending',
            approved: 'comment:approved',
            spam: 'comment:spam'
        };
        if (this.form && this.container) {
            this.setupEventListeners();
            this.loadComments();
        }
    }

    setupEventListeners() {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });
    }

    async loadComments() {
        if (!this.container) return;
        const path = window.location.pathname;
        
        try {
            this.container.innerHTML = '<p>Loading comments...</p>';
            
            // Only show approved comments
            const response = await fetch(
                `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues?labels=comment:${path},${this.labels.approved}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                this.displayComments(data);
            } else {
                this.container.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            this.container.innerHTML = '<p>Error loading comments. Please try again later.</p>';
        }
    }

    async submitComment() {
        const username = document.getElementById('username').value;
        const text = document.getElementById('comment-text').value;
        const path = window.location.pathname;

        try {
            // Submit comment as pending
            const response = await fetch('https://api.github.com/repos/Risch315815/Risch315815.github.io/issues', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `Comment by ${username} on ${path}`,
                    body: text,
                    labels: [
                        `comment:${path}`,
                        this.labels.pending,
                        'needs-notification'
                    ]
                })
            });

            if (response.ok) {
                this.form.reset();
                this.showMessage('Comment submitted and waiting for approval');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showMessage('Error posting comment. Please try again later.', 'error');
        }
    }

    // Admin functions for moderation
    async approveComment(issueNumber) {
        await this.moderateComment(issueNumber, this.labels.approved);
    }

    async markAsSpam(issueNumber) {
        await this.moderateComment(issueNumber, this.labels.spam);
    }

    async moderateComment(issueNumber, newLabel) {
        try {
            // Remove existing moderation labels
            const response = await fetch(
                `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues/${issueNumber}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        labels: [`comment:${window.location.pathname}`, newLabel]
                    })
                }
            );

            if (response.ok) {
                this.loadComments(); // Refresh comments
            }
        } catch (error) {
            console.error('Error moderating comment:', error);
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `comment-message ${type}`;
        messageDiv.textContent = message;
        this.form.insertAdjacentElement('beforebegin', messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    }

    // Add CSS for messages
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .comment-message {
                padding: 10px;
                margin: 10px 0;
                border-radius: 4px;
            }
            .comment-message.info {
                background: #e3f2fd;
                color: #0d47a1;
            }
            .comment-message.error {
                background: #ffebee;
                color: #c62828;
            }
            .moderation-controls {
                margin-top: 10px;
                font-size: 0.9em;
            }
            .moderation-controls button {
                margin-right: 10px;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    displayComments(comments) {
        if (!this.container || !Array.isArray(comments)) return;
        
        if (comments.length === 0) {
            this.container.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            return;
        }

        this.container.innerHTML = comments
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map(comment => `
                <div class="comment">
                    <div class="comment-header">
                        <span class="username">${this.escapeHtml(comment.user.login)}</span>
                        <span class="date">${new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="comment-body">${this.escapeHtml(comment.body)}</div>
                </div>
            `).join('');
    }

    // Helper function to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('comment-form')) {
        const commentSystem = new CommentSystem();
        commentSystem.addStyles();
        
        // Make available globally for admin controls
        window.commentSystem = commentSystem;
    }
}); 