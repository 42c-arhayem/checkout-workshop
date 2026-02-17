import AccountModel from '../../app/models/accountModel.js';
import CreditCardModel from '../../app/models/productModel.js';
import MeetingPlannerModel from '../../app/models/meetingModel.js';

const DATE_TIME = new RegExp('^[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T(?:[01][0-9]|2[0-3]):[0-5][0-9]$');

const productResolvers = {
  Query: {
    // Get the status of an existing credit card application
    getCardApplication: async (_, __, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const findCreditCard = account.products.find(product => product.type === "creditCard");

      if (!findCreditCard) {
        throw new Error("card application not found");
      }

      try {
        const doc = await CreditCardModel.findOne({ _id: findCreditCard.referenceId }).select("-__v");

        if (doc) {
          return doc;
        } else {
          throw new Error("unexpected error");
        }
      } catch (err) {
        console.log("Catching error in getCardApplication: ", err.message);
        throw new Error("unexpected error");
      }
    }
  },

  Mutation: {
    // Request a new credit card
    createCardApplication: async (_, { input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const { delivery } = input;

      // check for required input
      if (!delivery) {
        throw new Error("missing required field");
      }

      // validate input
      if (!['post', 'collect'].includes(delivery)) {
        throw new Error("invalid input");
      }

      // check if user already has a credit card or pending application
      if (account.products.find((product) => product.type === "creditCard" && product.status !== "cancelled")) {
        throw new Error("cannot apply for multiple credit cards.");
      }

      let newRecord = {
        _id: 1000 + await CreditCardModel.countDocuments(),
        name: account.name,
        delivery: delivery,
        address: delivery === 'post' ? account.postalAddress : undefined
      };

      try {
        // update credit card database collection
        await CreditCardModel.create(newRecord);

        let findAccount = await AccountModel.findById(account._id);

        findAccount.products.push({
          type: "creditCard",
          referenceId: newRecord._id
        });

        // update user account
        await findAccount.save();

        return {
          message: "success",
          referenceId: newRecord._id
        };
      } catch (err) {
        console.log("Catching error in createCardApplication: ", err.message);
        throw new Error("unexpected error");
      }
    },

    // Update an existing credit card application
    modifyCardApplication: async (_, { referenceId, input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const { delivery, postalAddress } = input;

      if ((delivery && !['post', 'collect'].includes(delivery)) ||
        (postalAddress && typeof postalAddress !== "object")) {
        throw new Error("invalid input");
      }

      let findRecord;

      try {
        // BUG: OWASP API-1 (BOLA)
        // Description: verify if the record to be modified, identified by 'referencedId', is associated with the authenticated users account
        // Solution:
        // if (!account.products.find(product => product.referenceId == referenceId)) {
        //    throw new Error("card application not found")
        // }

        findRecord = await CreditCardModel.findOne({ _id: referenceId });
      } catch (err) {
        console.log("Catching error in modifyCardApplication: ", err.message);
        throw new Error("unexpected error");
      }

      if (!findRecord) {
        throw new Error("not found");
      } else if (findRecord.status !== "pending") {
        throw new Error(`card status is: ${findRecord.status}`);
      }

      let updateData = {};

      switch (delivery) {
        case 'collect':
          updateData.delivery = delivery;
          updateData.address = {};
          break;
        case 'post':
          updateData.delivery = delivery;
          if (!postalAddress) {
            updateData.address = findRecord.address;
          } else {
            updateData.address = postalAddress;
          }
          break;
        case undefined:
          if (postalAddress) {
            if (findRecord.delivery === 'collect') {
              throw new Error("cannot modify delivery address when delivery method is collect");
            }
            updateData.address = postalAddress;
          } else {
            throw new Error("invalid request");
          }
          break;
        default:
          throw new Error("invalid request");
      }

      try {
        const updateRecord = await CreditCardModel.findOneAndUpdate(
          { _id: referenceId },
          { $set: updateData },
          { returnDocument: "after", new: true }
        ).select("-__v");

        return updateRecord;
      } catch (err) {
        console.log("Catching error in modifyCardApplication: ", err.message);
        throw new Error("unexpected error");
      }
    },

    // Delete an existing credit card application
    deleteCardApplication: async (_, { referenceId }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      if (!account.products.find(product => product.referenceId == referenceId)) {
        throw new Error("card application not found");
      }

      try {
        await AccountModel.findOneAndUpdate(
          { _id: account._id },
          { $pull: { products: { referenceId: referenceId } } },
        );

        await CreditCardModel.findOneAndUpdate(
          { _id: referenceId },
          { $set: { status: "cancelled" } },
        );

        return { message: "credit card application cancelled." };
      } catch (err) {
        console.log("Catching error in deleteCardApplication: ", err.message);
        throw new Error("unexpected error");
      }
    },

    // Create a meeting with mortgage advisor
    createMeeting: async (_, { input }, { account }) => {
      if (!account) {
        throw new Error("Unauthorized");
      }

      const { schedule } = input;

      if (!schedule || typeof schedule !== "string" || !DATE_TIME.test(schedule)) {
        throw new Error("invalid input");
      }

      try {
        const doc = await MeetingPlannerModel.findOne({ schedule }).select("-__v");

        if (doc) {
          throw new Error("the requested time slot is not available.");
        } else {
          // BUG: OWASP API-6 (Unrestricted Access to Sensitive Business Flows)
          // Description: A user can book all available timeslots of mortgage advisors
          // Solution: 
          // const existingMeeting = await MeetingPlannerModel.findOne({ "accountId": account._id }).select("-__v");
          // if (existingMeeting) {
          //     throw new Error("you cannot reserve more than one mortgage consultation");
          // }

          await MeetingPlannerModel.create({
            schedule: schedule,
            accountId: account._id.toString(),
          });

          return { message: "appointment with mortgage advisor is reserved." };
        }
      } catch (err) {
        console.log("Catching error in createMeeting: ", err.message);
        throw new Error(err.message || "unexpected error");
      }
    }
  }
};

export default productResolvers;
