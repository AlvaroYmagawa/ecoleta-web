import React, { ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

// CUSTOM IMPORTS
import './styles.css';
import api from '../../services/api';
import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse{
  nome: string;
}

const CreatePoint: React.FC = () => {
  const history = useHistory();

  // STATE
  const [items, setItems] = React.useState<Item[]>([]);
  const [ufs, setUfs] = React.useState<string[]>([]);
  const [citys, setCitys] = React.useState<string[]>([]);
  const [selectedUf, setSelectedUf] = React.useState('0');
  const [selectedCity, setSelectedCity] = React.useState('0');
  const [selectedPosition, setSelectedPosition] = React.useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = React.useState<[number, number]>([0, 0]);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    whatsapp: '',
  })
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

  // FUNCTIONS
  React.useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  },[])

  React.useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    })
  },[])

  React.useEffect(() => {
    if(selectedUf === '0') return;

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const cityNames = response.data.map(city => city.nome);
      setCitys(cityNames);
    })
  },[selectedUf])

  React.useEffect(() => {
    // Get current user location
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    })
  },[]);

  const isItemsEmpty = ():Boolean => items.length === 0;

  const handleSelectUf = (event: ChangeEvent<HTMLSelectElement>) => {
    const uf = event.target.value;
    
    setSelectedUf(uf);
  }

  const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
    const uf = event.target.value;
    
    setSelectedCity(uf);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ])
  };

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target;

    // Get the name of input and value then just change the input
    // value based on his name
    setFormData({...formData, [name]: value})
  }

  function handleSelectItem(id: number){
    // Find the index of id
    const alreadySelected = selectedItems.findIndex(item => item === id);

    //If do not have de id inside array will return - 1
    if(alreadySelected >= 0){
      // Receive all the array less the id
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    }else{
      setSelectedItems([...selectedItems, id]);
    }
  };

  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [ latitude, longitude ] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }

    await api.post('points', data);

    alert('cadastrado');

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form action="submit" onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input onChange={handleInputChange} type="text" name="name" id="name"/>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="name">Email</label>
              <input onChange={handleInputChange} type="email" name="email" id="email"/>
            </div>

            <div className="field">
              <label htmlFor="name">Whatsapp</label>
              <input onChange={handleInputChange} type="number" name="whatsapp" id="whatsapp"/>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                value={selectedUf}
                onChange={handleSelectUf}
                name="uf"
                id="uf">
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                value={selectedCity}
                onChange={handleSelectCity}
                id="city">
                <option value="0">Selecione uma Cidade</option>
                {citys.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>itens de coleta</h2>
            <span>Selecione um ou mais itens a baixo</span>
          </legend>

          <ul className="items-grid">
            {!isItemsEmpty() && items.map(item => 
              <li 
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                key={item.id}
                onClick={() => handleSelectItem(item.id)}>
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            )}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint;