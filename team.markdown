---
layout: page
title: Blog
permalink: /blog/
---

<!-- Introduction Section -->
<div class="blog-content" data-story-id="blog_content">
    <!-- Content will be inserted here by JavaScript -->
</div>

<!-- Featured Posts -->
<section class="featured-posts">
    <h2 class="section-title" data-story-id="featured_title">Featured Stories</h2>
    <div class="post-grid">
        {% for post in site.posts limit:3 %}
            <div class="post-card">
                <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
                <div class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</div>
                <p class="post-excerpt">{{ post.description }}</p>
            </div>
        {% endfor %}
    </div>
</section>

<!-- All Posts -->
<section class="all-posts">
    <h2 class="section-title" data-story-id="all_posts_title">All Posts</h2>
    <div class="post-list">
        {% for post in site.posts %}
            <article class="post-item">
                <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
                <div class="post-meta">
                    <span class="date">{{ post.date | date: "%Y-%m-%d" }}</span>
                    {% if post.categories %}
                        <span class="categories">
                            {% for category in post.categories %}
                                {{ category }}
                            {% endfor %}
                        </span>
                    {% endif %}
                </div>
            </article>
        {% endfor %}
    </div>
</section> 