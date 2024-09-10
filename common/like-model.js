/* eslint-disable import/no-unresolved */
import SimpleSchema from 'meteor/aldeed:simple-schema';
/* eslint-enable import/no-unresolved */

export default ({ Meteor, Mongo, BaseModel, LinkableModel, ServerTime }) => {
    const LikesCollection = new Mongo.Collection('socialize:likes');

    if (LikesCollection.configureRedisOplog) {
        LikesCollection.configureRedisOplog({
            mutation(options, { selector, doc }) {
                let linkedObjectId = (selector && selector.linkedObjectId) || (doc && doc.linkedObjectId);

                if (!linkedObjectId && selector._id) {
                    const comment = LikesCollection.findOne({ _id: selector._id }, { fields: { linkedObjectId: 1 } });
                    linkedObjectId = comment && comment.linkedObjectId;
                }

                if (linkedObjectId) {
                    Object.assign(options, {
                        namespace: linkedObjectId,
                    });
                }
            },
            cursor(options, selector) {
                if (selector.linkedObjectId) {
                    Object.assign(options, {
                        namespace: selector.linkedObjectId,
                    });
                }
            },
        });
    }

    const LikeSchema = new SimpleSchema({
        userId: {
            type: String,
            autoValue() {
                if (this.isInsert) {
                    return this.userId;
                }
                return undefined;
            },
            index: 1,
            denyUpdate: true,
        },
        createdAt: {
            type: Date,
            autoValue() {
                if (this.isInsert) {
                    return ServerTime.date();
                }
                return undefined;
            },
            denyUpdate: true,
        },
    });

    /**
    * A model of a like which is connected to another database object
    * @class Like
    */
    class Like extends LinkableModel(BaseModel) {
        /**
        * Get the User instance of the account which created the like
        * @returns {User} The user who created the like
        */
        user() {
            return Meteor.users.findOne({ _id: this.userId });
        }
        /**
        * Check if the user has already liked the linked object
        * @returns {[[Type]]} [[Description]]
        */
        isDuplicate() {
            return !!LikesCollection.findOne({ userId: this.userId, linkedObjectId: this.linkedObjectId });
        }
    }

    // attach the schema for a like
    LikesCollection.attachSchema(LikeSchema);

    // attach the LikesCollection to the Like model via BaseModel's attchCollection method
    Like.attachCollection(LikesCollection);

    // append the linkable schema so we are able to add linking information
    Like.appendSchema(LinkableModel.LinkableSchema);

    return { Like, LikesCollection };
};
