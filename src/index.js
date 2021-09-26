import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import './style.css';
//import Icon from './icon.png';

function component() {
    const element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    element.classList.add('col');

    const myIcon = new Image();
    myIcon.src = Icon;

    element.appendChild(myIcon);


    return element;
}

document.body.appendChild(component());
