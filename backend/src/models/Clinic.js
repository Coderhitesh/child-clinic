const mongoose = require("mongoose");
const seoSchema = require("./seoSchema");

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    address: {
      line1: String,
      line2: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "IN",
      },
    },
    mapLink: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    emergencyNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    logo: String,
    coverImage: String,
    images: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    specialities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Speciality",
      },
    ],
    feeOverrides: [
      {
        speciality: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Speciality",
          required: true,
        },
        consultationFee: {
          type: Number,
          min: 0,
        },
        followUpFee: {
          type: Number,
          min: 0,
        },
        followUpDays: {
          type: Number,
          min: 0,
        },
      },
    ],
    timings: {
      openTime: {
        type: String,
        default: "09:00",
      },
      closeTime: {
        type: String,
        default: "18:00",
      },
      workingDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5, 6],
      },
    },
    appointmentSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      slotDuration: {
        type: Number,
        default: 15,
      },
      bufferTime: {
        type: Number,
        default: 0,
      },
      advanceBookingDays: {
        type: Number,
        default: 30,
      },
      sameDayBooking: {
        type: Boolean,
        default: true,
      },
      allowOnlineBooking: {
        type: Boolean,
        default: true,
      },
      allowWalkIn: {
        type: Boolean,
        default: true,
      },
    },
    facilities: {
      type: [String],
      default: [],
    },
    paymentMethods: {
      type: [String],
      enum: ["cash", "card", "upi", "online", "insurance"],
      default: ["cash"],
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTemporarilyClosed: {
      type: Boolean,
      default: false,
    },
    temporaryClosureReason: {
      type: String,
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

clinicSchema.index({ location: "2dsphere" });
clinicSchema.index({ isActive: 1, isFeatured: 1, order: 1 });
clinicSchema.index({ "address.city": 1, isActive: 1 });
clinicSchema.index({ specialities: 1, isActive: 1 });

module.exports = mongoose.model("Clinic", clinicSchema);