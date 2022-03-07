function NavBar(props) {
    return (
        <nav>
            <ul>
                <li className="active"><a href="index.html" className="active">Accueil</a></li>
                <li><a href="map.html">Carte</a></li>
                <li><a href="list.html">Stations</a></li>
            </ul>
        </nav>
    ); 
}

const element = <NavBar/>;
ReactDOM.render(
    element, 
    document.getElementById('navbar')
); 

for(let i = 0; i<44; i++) {
    $('#footer').append('<i class="fa fa-bicycle fa-2x"></i><i class="fas fa-biking fa-2x"></i><i class="fab fa-pagelines fa-2x"></i>'); 
}

$('a').click(function(){
    $('a').animate({
    left: '400px',
    width: '+=150px', 
    color: '#92632a'
    }, 1000)
    .animate({
    opacity: '0.25'
    }, 1000);
    });