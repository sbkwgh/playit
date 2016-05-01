document.addEventListener('click', function(ev) {
	var button, toggleTab, content;

	if(!ev.target.matches('.toggle_tab-toggle, .toggle_tab-toggle i')) {
		return;
	}

	toggleTab = (ev.target.matches('i')) ?
		ev.target.parentElement.parentElement : ev.target.parentElement;
	button = toggleTab.querySelector('.toggle_tab-toggle');
	content = toggleTab.querySelector('.toggle_tab-content');

	content.classList.toggle('toggle_tab-content-show')
})