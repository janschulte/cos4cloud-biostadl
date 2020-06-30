import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location, StaReadInterfaceService } from '@helgoland/core';
import { MapCache } from '@helgoland/map';
import * as L from 'leaflet';
import { Observable } from 'rxjs';

import { LocationDialogComponent } from './../../components/location-dialog/location-dialog.component';
import { AuthService } from './../../services/auth.service';

const StaUrl = 'https://cos4cloud.demo.52north.org/sta/';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  public geometry: GeoJSON.GeoJsonObject;

  public authenticated: Observable<boolean>;

  constructor(
    private mapCache: MapCache,
    private authSrvc: AuthService,
    private sta: StaReadInterfaceService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.authenticated = this.authSrvc.isAuthenticated$;

    this.geometry = {
      type: 'Point',
      coordinates: [7.652, 51.935]
    } as GeoJSON.Point;
  }

  mapInitialized(mapId: string) {
    const map = this.mapCache.getMap(mapId);

    const markerFeatureGroup = L.markerClusterGroup();
    this.sta.getLocations(StaUrl, { $top: 10 }).subscribe(res => {
      res.value.forEach(loc => {
        const marker = L.geoJSON(loc.location);
        marker.on('click', this.handleSelection(loc));
        return markerFeatureGroup.addLayer(marker);
      });
      markerFeatureGroup.addTo(map);
      map.fitBounds(markerFeatureGroup.getBounds());
    });

  }


  private handleSelection(loc: Location): L.LeafletEventHandlerFn {
    return () => {
      const dialogRef = this.dialog.open(LocationDialogComponent, {
        data: loc
      });
    };
  }
}
