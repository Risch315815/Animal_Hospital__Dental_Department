class CommentSystem {
    constructor() {
        // Add loading status
        console.log('Loading CommentSystem...');

        // Token will be injected by GitHub Actions
        this.token = window.GITHUB_TOKEN;
        console.log('Token status:', {
            defined: typeof window.GITHUB_TOKEN !== 'undefined'
        });

        if (!this.token) {
            console.error('GitHub token is not available');
            return;
        }

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
                    'Authorization': `token ${this.token}`,
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
            // Get the current page path from the issue before updating
            const issueResponse = await fetch(
                `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues/${issueNumber}`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`
                    }
                }
            );
            const issue = await issueResponse.json();
            
            // Find the page-specific label (starts with 'comment:/')
            const pageLabel = issue.labels
                .find(label => label.name.startsWith('comment:/'))?.name;

            // Update with both labels
            const response = await fetch(
                `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues/${issueNumber}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        labels: [pageLabel, newLabel].filter(Boolean)
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
            .comment-body {
                white-space: pre-wrap;
                word-wrap: break-word;
                padding: 10px;
            }
            .comment-header .date {
                font-size: 0.9em;
                color: #666;
                margin-left: 10px;
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

        // Helper function to format date and time
        const formatDateTime = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '-');
        };

        this.container.innerHTML = comments
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))  // Oldest first
            .map(comment => {
                // Extract commenter name from title "Comment by {name} on {path}"
                const commenterName = comment.title.match(/Comment by (.*?) on/)?.[1] || comment.user.login;
                
                // Convert line breaks to <br> tags and preserve whitespace
                const formattedComment = this.escapeHtml(comment.body)
                    .replace(/\n/g, '<br>')
                    .replace(/\s{2,}/g, space => ' ' + '&nbsp;'.repeat(space.length - 1));
                
                return `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="username">${this.escapeHtml(commenterName)}</span>
                            <span class="date">${formatDateTime(comment.created_at)}</span>
                        </div>
                        <div class="comment-body">${formattedComment}</div>
                    </div>
                `;
            }).join('');
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

    // Static method to create admin instance
    static createAdminInstance() {
        const system = new CommentSystem();
        // Override methods for admin use
        system.approveComment = async (issueNumber) => {
            try {
                // Get the current issue to preserve its page label
                const issueResponse = await fetch(
                    `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues/${issueNumber}`,
                    {
                        headers: {
                            'Authorization': `token ${system.token}`
                        }
                    }
                );
                const issue = await issueResponse.json();
                const pageLabel = issue.labels
                    .find(label => label.name.startsWith('comment:/'))?.name;

                const response = await fetch(
                    `https://api.github.com/repos/Risch315815/Risch315815.github.io/issues/${issueNumber}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `token ${system.token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            labels: [pageLabel, 'comment:approved'].filter(Boolean)
                        })
                    }
                );
                if (response.ok) {
                    console.log('Comment approved:', issueNumber);
                    // Refresh the pending comments list
                    window.loadPendingComments?.();
                }
            } catch (error) {
                console.error('Error approving comment:', error);
            }
        };
        return system;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('comment-form')) {
        const commentSystem = new CommentSystem();
        commentSystem.addStyles();
        window.commentSystem = commentSystem;
    } else if (window.location.pathname === '/admin/') {
        // Initialize admin version
        window.commentSystem = CommentSystem.createAdminInstance();
    }
});

console.log('CommentSystem initialized:', window.commentSystem); 