import { BoardComponent } from './board/board.component';
import { GamesComponent } from './games/games.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'game', redirectTo: 'games'},
  {path: 'games', component: GamesComponent},
  {path: 'game/:id', redirectTo: 'games/:id'},
  {path: 'games/:id', component: BoardComponent},
  {path: '**', redirectTo: 'games'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
