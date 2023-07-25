module.exports = (sequelize, type) => {
  return sequelize.define('film', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: type.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    title: {
      type: type.STRING,
      allowNull: false,
      unique: 'uniqueFilm'
    },
    genre: {
      type: type.STRING,
      allowNull: false
    },
    releaseYear: {
      type: type.STRING,
      allowNull: false,
      unique: 'uniqueFilm'
    },
    isWatched: {
      type: type.BOOLEAN,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['title', 'releaseYear']
      }
    ]
  })
};