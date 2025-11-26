<script>
document.addEventListener('DOMContentLoaded', function() {
  const archiveList = document.querySelector('.archive-group-list');
  const currentPath = window.location.pathname;
  
  if (archiveList) {
    const allPostsItem = document.createElement('li');
    allPostsItem.className = 'archive-group';
    
    const allPostsLink = document.createElement('a');
    allPostsLink.href = '/articles'; // Your blog page URL
    allPostsLink.className = 'archive-group-name-link';
    allPostsLink.textContent = '‹ All Topics';
    
    // Highlight if on main blog page
    if (currentPath === '/articles' || currentPath === '/articles/') {
      allPostsLink.style.color = 'var(--primary-accent)';
      allPostsLink.style.fontWeight = 'var(--bold)';
    }
    
    allPostsItem.appendChild(allPostsLink);
    archiveList.appendChild(allPostsItem); // Changed to appendChild
  }
});
</script>
