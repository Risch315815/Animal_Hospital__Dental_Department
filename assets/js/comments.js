class CommentSystem {
    constructor() {
        this.form = document.getElementById('comment-form');
        this.container = document.getElementById('comments-container');
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
        // Get current page path
        const path = window.location.pathname;
        
        try {
            const response = await fetch(`https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/issues?labels=comment:${path}`);
            const comments = await response.json();
            
            this.displayComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    async submitComment() {
        const username = document.getElementById('username').value;
        const text = document.getElementById('comment-text').value;
        const path = window.location.pathname;

        try {
            // Create GitHub issue as comment
            const response = await fetch('https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/issues', {
                method: 'POST',
                headers: {
                    'Authorization': 'token YOUR_GITHUB_TOKEN',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `Comment by ${username}`,
                    body: text,
                    labels: [`comment:${path}`]
                })
            });

            if (response.ok) {
                this.form.reset();
                this.loadComments();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    }

    displayComments(comments) {
        if (!this.container) return;
        this.container.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="username">${comment.user.login}</span>
                    <span class="date">${new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <div class="comment-body">${comment.body}</div>
            </div>
        `).join('');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('comment-form')) {
        new CommentSystem();
    }
}); 