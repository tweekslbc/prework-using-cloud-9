const Sequelize = require ('sequelize');
const { VIRTUAL, DECIMAL, STRING, UUID, UUIDV4 } = Sequelize;

const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/users_stories_reviews_db');

const uuidDefinition = {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
};

const User = conn.define('user', {
    id: uuidDefinition,
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fullName: {
        type: VIRTUAL,
        get: function(){
            return `${this.firstName} ${this.lastName}`;
        }
    }
});
const Story = conn.define('story', {
    id: uuidDefinition,
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
const Review = conn.define('review', {
    id: uuidDefinition,
    rating: DECIMAL
});

Story.belongsTo(User, { as: 'author'});
User.hasMany(Story, { foreignKey: 'authorId'});

Review.belongsTo(User, { as: 'reviewer'});
Review.belongsTo(Story);

Story.hasMany(Review);
User.hasMany(Review, {foreignKey: 'reviwerId'});

User.belongsto(User, { as: 'manager'});
User.hasMany(User, { as: 'manages', foreignKey: 'managerId'});

const syncAndSeed = async () => {
    await conn.sync({ force: true});
    const users = [
      {firstName: 'moe', lastName: 'green'},
      {firstName: 'larry', lastName: 'blue'},
      {firstName: 'curly', lastName: 'red'}
 ];
 const [moe, larry, curly] = await Promise.all(users.map( user => User.create(user)));
 const stories = [
     { title: 'Node is great', authorId: moe.id },
     { title: 'I love Sequelize', authorId: moe.id },
     { title: 'JavaScript Rocks', authorId: curly.id }
 ];
 const [nodeStory, seqStory, jsStory] = await Promise.all(stories.map( story => Story.create(story)));
 const reviews = [
   { reviewerId: larry.id, storyId: nodeStory.id, rating: 2 }, 
   { reviewerId: curly.id, storyId: nodeStory.id, rating: 4.3 }, 
];
await(Promise.all(reviews.map((review) => Review.create(review))));  

moe.managerId = larry.id;
await moe.save();


};

module.exports = {
    syncAndSeed,
    models: {
        User,
        Story,
        Review
    }
};