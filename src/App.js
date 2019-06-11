import React, { Component } from 'react';
import Particles from 'react-particles-js';
import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkFrom from './components/ImageLinkFrom/ImageLinkFrom';
import Rank from './components/Rank/Rank.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js'
import Signin from './components/Signin/Signin.js'
import Register from './components/Register/Register.js'


const particlesOptions = {
    particles: {
        number: {
            value: 30,
            density: {
                enable: true,
                value_area: 800
            }
        }
    }
}
const initialState = {
            input: '',
            imageUrl: '',
            box:{},
            route:'signin',
            isSignedIn:false,
            user: {
                id: '',
                name: '',
                email: '',
                enteries: 0,
                joined: ''
            }

        }

class App extends Component {
    constructor() {
        super();
        this.state = initialState ;
    }
    
    loadUser = (data)=>{
        this.setState({user: {
            id: data.id,
            name: data.name,
            email: data.email,
            enteries: data.entries,
            joined: data.joined
        }})
    }

    calculateFaceLocation =(data)=>{
    	const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    	const image = document.getElementById('inputimage');
    	const width =Number(image.width);
    	const height = Number(image.height);
    	return {
    		leftCol:clarifaiFace.left_col * width,
    		topRow:clarifaiFace.top_row * height,
    		rightCol:width - (clarifaiFace.right_col * width),
    		bottomRow:height - (clarifaiFace.bottom_row * height),
    		}
    	}

	displayFaceBox = (box) =>{
		this.setState({box:box})
	} 

    onInputChange = (event) => {
        this.setState({ input: event.target.value });
    }
    onButtonSubmit = () => {
        this.setState({ imageUrl: this.state.input })
            fetch('https://murmuring-castle-36871.herokuapp.com/imageurl', {
                method: 'post',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({
                    input: this.state.input,
                    })
                })
                .then(response => response.json())
                .then(response => {
                    if(response){
                        fetch('https://murmuring-castle-36871.herokuapp.com/image', {
                            method: 'put',
                            headers:{'Content-Type':'application/json'},
                            body: JSON.stringify({
                                id: this.state.user.id,
                              })
                            })
                                .then(response=>response.json())
                                .then(count=>{
                                    this.setState(Object.assign(this.state.user, {enteries:count}))
                                })
                                .catch(console.log)
                    }
                this.displayFaceBox(this.calculateFaceLocation(response))
                })
            .catch(err=>console.log(err))
            
    }

    onRouteChange = (route) => {
    	if(route  === 'signout'){
    		this.setState(initialState)
    	}else if(route === 'home'){
    		this.setState({isSignedIn:true})
    	}
    	this.setState({route: route})
    }

    render() {
    	const { isSignedIn ,imageUrl ,route , box } = this.state;
        return (
            <div className="App">
    	 		<Particles className='particles'
              	particlesarams={{particlesOptions}}
            	/>
            	<Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
            	{ route === 'home' 
            		?	<div>
     		 				<Logo />
      						<Rank 
                                name={this.state.user.name}
                                enteries={this.state.user.enteries}
                            />
      						<ImageLinkFrom 
      						onInputChange={this.onInputChange} 
      						onButtonSubmit={this.onButtonSubmit} 
      						/> 
            				<FaceRecognition box={box} imageUrl={imageUrl} />
            			</div>
     		 		:   ( 
                            route === 'signin'
     		 				?	<Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
     		 				:	<Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
     		 				)
            	}
    			</div>
        );
    }

}

export default App;