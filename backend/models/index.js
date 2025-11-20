import sequelize from '../config/db.js';
import Usuario from './Usuario.js';
import Pareja from './Pareja.js';
import Cita from './Cita.js';
import Nota from './Nota.js';
import Pelicula from './Pelicula.js';
import Album from './Album.js';
import Cancion from './Cancion.js';
import ListaPelicula from './ListaPelicula.js';
import ListaCancion from './ListaCancion.js';
import ListaAlbum from './ListaAlbum.js';
import Ranking from './Ranking.js';

// ========================================
// RELACIONES ENTRE MODELOS
// ========================================

// ============= USUARIO - PAREJA =============
Pareja.belongsTo(Usuario, {
  foreignKey: 'id_usuario1',
  as: 'usuario1'
});

Pareja.belongsTo(Usuario, {
  foreignKey: 'id_usuario2',
  as: 'usuario2'
});

Usuario.hasOne(Pareja, {
  foreignKey: 'id_usuario1',
  as: 'parejaComoUsuario1'
});

Usuario.hasOne(Pareja, {
  foreignKey: 'id_usuario2',
  as: 'parejaComoUsuario2'
});

// ============= PAREJA - CITAS =============
Pareja.hasMany(Cita, {
  foreignKey: 'id_pareja',
  as: 'citas'
});

Cita.belongsTo(Pareja, {
  foreignKey: 'id_pareja',
  as: 'pareja'
});

// ============= CITA - NOTAS =============
Cita.hasMany(Nota, {
  foreignKey: 'id_cita',
  as: 'notas'
});

Nota.belongsTo(Cita, {
  foreignKey: 'id_cita',
  as: 'cita'
});

// ============= USUARIO - NOTAS =============
Usuario.hasMany(Nota, {
  foreignKey: 'id_usuario',
  as: 'notas'
});

Nota.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

// ============= USUARIO - RANKING =============
Usuario.hasMany(Ranking, {
  foreignKey: 'id_usuario',
  as: 'rankings'
});

Ranking.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

// ============= ÁLBUM - CANCIONES =============
Album.hasMany(Cancion, {
  foreignKey: 'id_album',
  as: 'canciones'
});

Cancion.belongsTo(Album, {
  foreignKey: 'id_album',
  as: 'album'
});

// ============= MANY-TO-MANY: PAREJA - PELÍCULAS =============
Pareja.belongsToMany(Pelicula, {
  through: ListaPelicula,
  foreignKey: 'id_pareja',
  otherKey: 'id_pelicula',
  as: 'peliculas'
});

Pelicula.belongsToMany(Pareja, {
  through: ListaPelicula,
  foreignKey: 'id_pelicula',
  otherKey: 'id_pareja',
  as: 'parejas'
});

// Relaciones directas con la tabla intermedia
ListaPelicula.belongsTo(Pareja, { foreignKey: 'id_pareja', as: 'pareja' });
ListaPelicula.belongsTo(Pelicula, { foreignKey: 'id_pelicula', as: 'pelicula' });
Pareja.hasMany(ListaPelicula, { foreignKey: 'id_pareja', as: 'listaPeliculas' });
Pelicula.hasMany(ListaPelicula, { foreignKey: 'id_pelicula', as: 'enListas' });

// ============= MANY-TO-MANY: PAREJA - CANCIONES =============
Pareja.belongsToMany(Cancion, {
  through: ListaCancion,
  foreignKey: 'id_pareja',
  otherKey: 'id_cancion',
  as: 'canciones'
});

Cancion.belongsToMany(Pareja, {
  through: ListaCancion,
  foreignKey: 'id_cancion',
  otherKey: 'id_pareja',
  as: 'parejas'
});

// Relaciones directas con la tabla intermedia
ListaCancion.belongsTo(Pareja, { foreignKey: 'id_pareja', as: 'pareja' });
ListaCancion.belongsTo(Cancion, { foreignKey: 'id_cancion', as: 'cancion' });
Pareja.hasMany(ListaCancion, { foreignKey: 'id_pareja', as: 'listaCanciones' });
Cancion.hasMany(ListaCancion, { foreignKey: 'id_cancion', as: 'enListas' });

// ============= MANY-TO-MANY: PAREJA - ÁLBUMES =============
Pareja.belongsToMany(Album, {
  through: ListaAlbum,
  foreignKey: 'id_pareja',
  otherKey: 'id_album',
  as: 'albumes'
});

Album.belongsToMany(Pareja, {
  through: ListaAlbum,
  foreignKey: 'id_album',
  otherKey: 'id_pareja',
  as: 'parejas'
});

// Relaciones directas con la tabla intermedia
ListaAlbum.belongsTo(Pareja, { foreignKey: 'id_pareja', as: 'pareja' });
ListaAlbum.belongsTo(Album, { foreignKey: 'id_album', as: 'album' });
Pareja.hasMany(ListaAlbum, { foreignKey: 'id_pareja', as: 'listaAlbumes' });
Album.hasMany(ListaAlbum, { foreignKey: 'id_album', as: 'enListas' });

// ========================================
// EXPORTAR
// ========================================
const db = {
  sequelize,
  Usuario,
  Pareja,
  Cita,
  Nota,
  Pelicula,
  Album,
  Cancion,
  ListaPelicula,
  ListaCancion,
  ListaAlbum,
  Ranking
};

export default db;
export {
  sequelize,
  Usuario,
  Pareja,
  Cita,
  Nota,
  Pelicula,
  Album,
  Cancion,
  ListaPelicula,
  ListaCancion,
  ListaAlbum,
  Ranking
};