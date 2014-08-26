globe.graphicMobile = function(bodyElements, drawerElements) {

	$('#gf').prepend(window.JST['mobile.template']({hed: $('.main-hed').html()}));

	if (drawerElements) {
		$(drawerElements).appendTo('#gf .mobile-drawer');
	} else {
		$('#gf > .subtitle').appendTo('#gf .mobile-drawer');
		$('#gf .source-and-credit').appendTo('#gf .mobile-drawer');
	}

	$(bodyElements).appendTo('#gf .mobile-body');

	$('#gf').attr('data-drawer', 'expanded');

	function expandDrawer() {

		// notice we make border transparent immediately,
		// and after the navicon is done transitioning, again
		// this is to cover the edge case of clicking collapse-expand
		// without waiting for collapse to finish

		// the header has a black bottom border
		// immediately make the border transparent
		$('#gf .mobile-header .navicon').bind('transitionend oTransitionEnd webkitTransitionEnd', function(e) {

			$('#gf .mobile-header').addClass('expanded'); // make bottom border transparent
			$('#gf .mobile-header .navicon').unbind();
		});

		$('#gf .mobile-header').addClass('expanded'); // make bottom border transparent
		$('#gf .mobile-drawer').addClass('expanded'); // translate drawer down
		$('#gf .mobile-header .navicon').addClass('minus'); // animate 3 lines to minus

		$('#gf').attr('data-drawer', 'expanded');
	}

	function collapseDrawer() {

		// the header has a white bottom border
		// wait until the drawer has collapsed,
		// then make the border transparent
		$('#gf .mobile-header .navicon').bind('transitionend oTransitionEnd webkitTransitionEnd', function(e) {

			$('#gf .mobile-header').removeClass('expanded'); // make bottom border black
			$('#gf .mobile-header .navicon').unbind();
		});

		$('#gf .mobile-drawer').removeClass('expanded'); // translate drawer up
		$('#gf .mobile-header .navicon').removeClass('minus'); // animate minus to 3 lines

		$('#gf').attr('data-drawer', 'collapsed');
	}

	function toggleDrawer() {

		if ($('#gf').attr('data-drawer') === 'expanded') {
			collapseDrawer();
		} else {
			expandDrawer();
		}

	}

	$('#gf .mobile-header .navicon').click(toggleDrawer);

	return {
		expandDrawer: expandDrawer,
		collapseDrawer: collapseDrawer
	};

};