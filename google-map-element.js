import { LitElement, html, css } from 'lit-element';

/**
 * `google-map-element`
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

      heading: {
        type: Number,
      },

      tilt: {
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

      mapTypeId: {
        type: String,
        attribute: 'map-type-id'
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
    this.heading = 0;
    this.tilt = 0;
    this.disableDefaultUI = false;
    this.zoomControl = undefined;
    this.mapTypeId = 'roadmap';
    this.mapTypeControl = undefined;
    this.scaleControl = undefined;
    this.streetViewControl = undefined;
    this.rotateControl = undefined;
    this.fullscreenControl = undefined;
    this.gestureHandling = 'auto';
    this.styles = [];
    this.updateComplete.then(this._initSlot.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();
    window.requestAnimationFrame(() => {
      if(!this._map && window.google && window.google.maps) this._initMap();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    var slot = this.shadowRoot.querySelector('slot');
    if(!slot) return;
    slot.removeEventListener('slotchange', this._handleSlotChange.bind(this));
  }

  updated(props) {
    super.updated();
    if(props.has('apiKey') && !!this.apiKey) this._loadScript();
    this._updateMap(props);
  }

  _initSlot() {
    var slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', this._handleSlotChange.bind(this));
  }

  _handleSlotChange() {
    this._setMarkers();
  }

  _setMarkers() {
    if(!this._map) return;
    var slot = this.shadowRoot.querySelector('slot');
    var markers = slot.assignedNodes().filter((item) => item.nodeName === 'GOOGLE-MAP-MARKER');
    markers.map((marker) => marker._map = this._map);
  }

  _loadScript() {
    if(window.google && window.google.maps) return;
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?' + (this.apiKey ? `key=${this.apiKey}` : '');
    script.async = true;
    script.defer = true;
    script.onload = this._initMap.bind(this);
    document.head.appendChild(script);
  }

  _initMap() {
    if(this._map) return;

    this._map = new window.google.maps.Map(this.shadowRoot.querySelector('#map'), this.options);
    this._map.addListener('idle', this._handleIdle.bind(this));
    this._map.addListener('center_changed', this._handleCenterChanged.bind(this));
    this._map.addListener('zoom_changed', this._handleZoomChanged.bind(this));
    this._map.addListener('bounds_changed', this._fireChangeEvent.bind(this, 'bounds'));
    this._map.addListener('dragstart', this._handleDragstart.bind(this));
    this._map.addListener('maptypeid_changed', this._handleMapTypeIdChanged.bind(this));
    this._setMarkers(this.shadowRoot.querySelector('slot'));
  }

  _updateMap(props) {
    var options = {};
    props.forEach((item, propName) => {
      if(propName) options[propName] = this[propName];
      this._fireChangeEvent(propName);
    });

    if(props.has('latitude') || props.has('longitude')) {
      options.center = {lat: this.latitude, lng: this.longitude};
      delete options.latitude;
      delete options.longitude;
    }

    if(!this._map || !this._map.setOptions || !this._idle) return;
    this._map.setOptions(options);
  }

  _fireChangeEvent(propName) {
    this.dispatchEvent(new CustomEvent(`${this._camelCaseToDash(propName)}-changed`, {
      detail: { value: this[propName] },
      composed: true,
    }));
  }

  get center() {
    return this._map ? this._map.getCenter() : null;
  }

  get bounds() {
    return this._map ? this._map.getBounds() : null;
  }

  get options() {
    return {
      center: {lat: this.latitude || 52.3680, lng: this.longitude || 4.9036},
      zoom: this.zoom || 10,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      heading: this.heading,
      tilt: this.tilt,
      disableDefaultUI: this.disableDefaultUI,
      zoomControl: this.zoomControl,
      mapTypeId: this.mapTypeId,
      mapTypeControl: this.mapTypeControl,
      scaleControl: this.scaleControl,
      streetViewControl: this.streetViewControl,
      rotateControl: this.rotateControl,
      fullscreenControl: this.fullscreenControl,
      gestureHandling: this.gestureHandling,
      styles: this.styles
    };
  }

  _handleDragstart() {
    this._idle = false;
  }

  _handleIdle() {
    this._idle = true;
  }

  _handleZoomChanged() {
    this.zoom = this._map.zoom;
  }

  _handleCenterChanged() {
    this.latitude = this.center.lat();
    this.longitude = this.center.lng();
    this._fireChangeEvent('center');
  }

  _handleMapTypeIdChanged() {
    this.mapTypeId = this._map.mapTypeId;
  }

  _camelCaseToDash( myStr ) {
    return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      #map {
        min-height: 100%;
        width: 100%;
      }
    `;
  }

  render() {
    return html`
      <section id="map"></section>
      <slot></slot>
    `;
  }

}

window.customElements.define('google-map', GoogleMap);
