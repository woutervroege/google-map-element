import { LitElement, html } from 'lit-element';

/**
 * `google-map`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class GoogleMap extends LitElement {
  static get properties() {
    return {
      apiKey: {
        type: String,
        attribute: 'api-key'
      },

      zoom: {
        type: Number,
      },

      minZoom: {
        type: Number,
        attribute: 'min-zoom'
      },

      maxZoom: {
        type: Number,
        attribute: 'max-zoom'
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },

      disableDefaultUI: {
        type: Boolean,
        attribute: 'disable-default-ui'
      },

      zoomControl: {
        type: Boolean,
        attribute: 'zoom-control'
      },

      mapTypeControl: {
        type: Boolean,
        attribute: 'map-type-control'
      },

      scaleControl: {
        type: Boolean,
        attribute: 'scale-control'
      },

      streetViewControl: {
        type: Boolean,
        attribute: 'street-view-control'
      },

      rotateControl: {
        type: Boolean,
        attribute: 'rotate-control'
      },

      fullscreenControl: {
        type: Boolean,
        attribute: 'fullscreen-control'
      },

      gestureHandling: {
        type: String,
        attribute: 'gesture-handling'
      },

      styles: {
        type: Array
      },

      _map: {
        type: Object
      }
    };
  }

  constructor() {
    super();
    this.apiKey = null;
    this.zoom = 10;
    this.minZoom = null;
    this.maxZoom = null;
    this.latitude = 52.3680;
    this.longitude = 4.9036;
    this.disableDefaultUI = false;
    this.zoomControl = undefined;
    this.mapTypeControl = undefined;
    this.scaleControl = undefined;
    this.streetViewControl = undefined;
    this.rotateControl = undefined;
    this.fullscreenControl = undefined;
    this.gestureHandling = 'auto';
    this.styles = [];
  }

  updated(props) {
    super.updated();
    if(props.has('apiKey') && !!this.apiKey) this._loadScript();
    if(!this._idle) return;
    this._updateMap();
  }

  _loadScript() {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?' + (this.apiKey ? `key=${this.apiKey}` : '');
    script.async = true;
    script.defer = true;
    script.onload = this._initMap.bind(this);
    document.head.appendChild(script);
  }

  _initMap() {
    if(this._map) return;

    this._map = new google.maps.Map(this.shadowRoot.querySelector('#map'), this.options);
    this._map.addListener('idle', this._handleIdle.bind(this));
    this._map.addListener('center_changed', this._handleCenterChanged.bind(this));
    this._map.addListener('zoom_changed', this._handleZoomChanged.bind(this));
    this._map.addListener('dragstart', this._handleDragstart.bind(this));
  }

  _updateMap() {
    if(!this._map || !this._map.setOptions || !this._idle) return;
    this._map.setOptions(this.options);
  }

  get options() {
    return {
      center: {lat: this.latitude, lng: this.longitude},
      zoom: this.zoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      disableDefaultUI: this.disableDefaultUI,
      zoomControl: this.zoomControl,
      mapTypeControl: this.mapTypeControl,
      scaleControl: this.scaleControl,
      streetViewControl: this.streetViewControl,
      rotateControl: this.rotateControl,
      fullscreenControl: this.fullscreenControl,
      gestureHandling: this.gestureHandling,
      styles: this.styles
    }
  }

  _handleDragstart() {
    this._idle = false;
  }

  _handleIdle() {
    this._idle = true;
  }

  _handleZoomChanged() {
    this.zoom = this._map.zoom;
    this.dispatchEvent(new CustomEvent('zoomchanged', {
      detail: { value: this.zoom },
      composed: true,
      bubbles: true
    }))
  }

  _handleCenterChanged() {
    this.latitude = this._map.center.lat();
    this.longitude = this._map.center.lng();
    this.dispatchEvent(new CustomEvent('centerchanged', {
      detail: { latitude: this.latitude, longitude: this.longitude },
      composed: true,
      bubbles: true
    }))
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        #map {
          height: 100%;
          width: 100%;
        }
      </style>
      <section id="map"></section>
    `;
  }

}

window.customElements.define('google-map', GoogleMap);
