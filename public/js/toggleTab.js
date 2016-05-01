document.addEventListener('click', function(ev) {
	var button, toggleTab, content;

	if(!ev.target.matches('.toggle_tab-toggle, .toggle_tab-toggle i')) {
		return;
	}

	toggleTab = (ev.target.matches('i')) ?
		ev.target.parentElement.parentElement : ev.target.parentElement;
	button = toggleTab.querySelector('.toggle_tab-toggle');
	content = toggleTab.querySelector('.toggle_tab-content');

	if(window.getComputedStyle(content).display === 'none') {
		content.style.display = 'block';
	} else {
		content.style.display = 'none';
	}
})