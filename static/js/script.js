
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});





const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
	if (this.checked) {
		document.body.classList.add('dark');
		var userDataImages = document.getElementsByClassName('Userdata');
		for (var i = 0; i < userDataImages.length; i++) {
			//userDataImages[i].src = '/img/User_Icon_Light.png';	
		}
	} else {
		document.body.classList.remove('dark');
		var userDataImages = document.getElementsByClassName('Userdata');
		for (var i = 0; i < userDataImages.length; i++) {
			//userDataImages[i].src = '/img/User_Icon_Dark.png';
		}
	}
});




const vines = document.querySelectorAll('.vine');

document.querySelector('nav').addEventListener('mousemove', (event) => {
    vines.forEach(vine => {
        const vinePos = vine.getBoundingClientRect();
        const distance = Math.hypot(event.clientX - vinePos.left, event.clientY - vinePos.top);

        // Move vine away from cursor if close
        if (distance < 100) {
            const angle = Math.atan2(event.clientY - vinePos.top, event.clientX - vinePos.left);
            vine.style.transform = `rotate(${angle}rad) translateX(50px)`;
        } else {
            vine.style.transform = 'rotate(0)';
        }
    });
});

