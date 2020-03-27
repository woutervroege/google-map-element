import { LitElement } from 'lit-element';

/**
 * `google-map-element-marker`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class GoogleMapMarker extends LitElement {
  static get properties() {
    return {

      title: {
        type: String,
      },

      label: {
        type: String,
      },

      info: {
        type: String,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },

      draggable: {
        type: Boolean,
      },

      open: {
        type: Boolean
      },

      hidden: {
        type: Boolean,
        reflect: true
      },

      _map: {
        type: Object
      },

      _marker: {
        type: Object
      },

      _idle: {
        type: Boolean
      }

    };
  }

  constructor() {
    super();
    this.title = 'hello world';
    this.label = null;
    this.info = null;
    this.latitude = 52.3680;
    this.longitude = 4.9036;
    this.draggable = false;
    this.open = false;
    this._map = null;
    this._idle = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this._marker && this._map && this._marker.setMap(this._map);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._marker && this._marker.setMap(null);
  }

  updated(props) {
    if(props.has('_map') && this._map) this._mapChanged();
    if(props.has('latitude') || props.has('longitude')) this._positionChanged();
    if(props.has('latitude')) this._fireChangeEvent('latitude');
    if(props.has('longitude')) this._fireChangeEvent('longitude');
    if(props.has('title')) this._titleChanged();
    if(props.has('label')) this._labelChanged();
    if(props.has('info')) this._infoChanged();
    if(props.has('draggable')) this._draggableChanged();
    if(props.has('animation')) this._animationChanged();
    if(props.has('open')) this._openChanged();
    if(props.has('hidden')) this._hiddenChanged();
  }

  _mapChanged() {
    this._marker = new window.google.maps.Marker({
      position: new window.google.maps.LatLng(this.latitude, this.longitude),
      title: this.title,
      label: this.label,
      draggable: this.draggable,
      visible: true
    });
    this._marker.addListener('dragstart', this._handleDragstart.bind(this));
    this._marker.addListener('idle', this._handleIdle.bind(this));
    this._marker.addListener('position_changed', this._handlePositionChanged.bind(this));
    this._marker.setMap(this._map);
    this.requestUpdate('info', Math.random());
  }

  _positionChanged() {
    if (this._marker && this.latitude != null && this.longitude != null && this._idle) {
      this._marker.setPosition(new window.google.maps.LatLng(parseFloat(this.latitude), parseFloat(this.longitude)));
    }
  }

  _titleChanged() {
    this._marker && this._marker.setTitle(this.title);
  }

  _labelChanged() {
    this._marker && this._marker.setLabel(this.label);
  }

  _infoChanged() {
    if(!window.google) return;

    if(this.info) {
      if (!this._infoWindow) {
        this._infoWindow = new window.google.maps.InfoWindow();
        this._handleInfoOpen = window.google.maps.event.addListener(this._marker, 'click', () => this.open = true );
        this._handleInfoClose = window.google.maps.event.addListener(this._infoWindow, 'closeclick', () => this.open = false );
      }
      this._infoWindow.setContent(this.info);
    }
    else {
      if (this._infoWindow) {
        window.google.maps.event.removeListener(this._handleInfoOpen);
        window.google.maps.event.removeListener(this._handleInfoClose);
        this._infoWindow = null;
      }
    }
  }

  _openChanged() {
    if (this._infoWindow) {
      if (this.open) this._infoWindow.open(this._map, this._marker);
      else this._infoWindow.close();
      this._fireChangeEvent('open');
    }
  }

  _draggableChanged() {
    this._marker && this._marker.setDraggable(this.draggable);
  }

  _hiddenChanged() {
    this._marker && this._marker.setVisible(!this.hidden);
  }

  _fireChangeEvent(propName) {
    this.dispatchEvent(new CustomEvent(`${this._camelCaseToDash(propName)}-changed`, {
      detail: { value: this[propName] },
      composed: true,
    }));
  }

  _camelCaseToDash( myStr ) {
    return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
  }

  _handleDragstart() {
    this._idle = false;
  }

  _handleIdle() {
    this._idle = true;
  }

  _handlePositionChanged() {
    this.latitude = this._marker.position.lat();
    this.longitude = this._marker.position.lng();
  }

}

window.customElements.define('google-map-marker', GoogleMapMarker);