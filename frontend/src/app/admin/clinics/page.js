"use client";

import { useEffect, useState } from "react";
import { clinicApi, specialityApi } from "@/services";
import { useAuthStore, isSuperAdmin } from "@/store/authStore";
import ResourceManager from "@/components/admin/resource-manager";
import { StatusBadge } from "@/components/ui/badge";

export default function ClinicsPage() {
  const user = useAuthStore((s) => s.user);
  const [specialities, setSpecialities] = useState([]);

  useEffect(() => {
    specialityApi
      .list()
      .then((d) => setSpecialities(d || []))
      .catch(() => {});
  }, []);

  const api = isSuperAdmin(user)
    ? clinicApi
    : {
        list: clinicApi.list,
        update: clinicApi.update,
        create: undefined,
        remove: undefined,
      };

  return (
    <ResourceManager
      title="Clinics"
      sub="Manage clinic locations, contact details, timings, facilities, booking settings and SEO."
      api={api}
      canWrite
      canCreate={isSuperAdmin(user)}
      listParams={{ includeInactive: "true" }}
      addLabel="Add clinic"
      defaults={{
        order: 0,
        isFeatured: false,
        isActive: true,
        isTemporarilyClosed: false,
        address: {
          country: "IN",
        },
        location: {
          type: "Point",
          coordinates: [],
        },
        images: [],
        specialities: [],
        facilities: [],
        paymentMethods: ["cash"],
        timings: {
          openTime: "09:00",
          closeTime: "18:00",
          workingDays: [1, 2, 3, 4, 5, 6],
        },
        appointmentSettings: {
          enabled: true,
          slotDuration: 15,
          bufferTime: 0,
          advanceBookingDays: 30,
          sameDayBooking: true,
          allowOnlineBooking: true,
          allowWalkIn: true,
        },
        timezone: "Asia/Kolkata",
        seo: {},
      }}
      searchKeys={[
        "name",
        "slug",
        "code",
        "address.city",
        "phone",
        "whatsappNumber",
        "email",
      ]}
      lookups={{
        specialities: specialities.map((s) => ({
          value: s._id,
          label: s.name,
        })),
      }}
      columns={[
        {
          key: "image",
          header: "Image",
          render: (r) =>
            r.coverImage || r.images?.[0] ? (
              <img
                src={r.coverImage || r.images?.[0]}
                alt={r.name || "Clinic"}
                className="h-10 w-20 rounded-md object-cover"
              />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: "name",
          header: "Clinic",
        },
        {
          key: "address.city",
          header: "City",
        },
        {
          key: "phone",
          header: "Phone",
        },
        {
          key: "isFeatured",
          header: "Featured",
          render: (r) => (
            <StatusBadge
              value={r.isFeatured ? "confirmed" : "cancelled"}
              label={r.isFeatured ? "Yes" : "No"}
            />
          ),
        },
        {
          key: "order",
          header: "Order",
        },
        {
          key: "specialities",
          header: "Specialities",
          render: (r) => `${r.specialities?.length || 0} offered`,
        },
        {
          key: "isActive",
          header: "Status",
          render: (r) => (
            <StatusBadge
              value={r.isActive ? "confirmed" : "cancelled"}
              label={r.isActive ? "Active" : "Inactive"}
            />
          ),
        },
      ]}
      fields={[
        {
          type: "section",
          label: "Basic information",
        },
        {
          name: "name",
          label: "Clinic name",
          required: true,
        },
        {
          name: "slug",
          label: "Slug",
          placeholder: "delhi-child-care",
          help: "SEO-friendly clinic URL.",
        },
        {
          name: "code",
          label: "Clinic code",
          placeholder: "CLINIC001",
        },
        {
          name: "shortDescription",
          label: "Short description",
          type: "textarea",
          rows: 2,
          full: true,
        },
        {
          name: "description",
          label: "Full description",
          type: "textarea",
          rows: 5,
          full: true,
        },

        {
          type: "section",
          label: "Contact information",
        },
        {
          name: "phone",
          label: "Phone",
        },
        {
          name: "alternatePhone",
          label: "Alternate phone",
        },
        {
          name: "whatsappNumber",
          label: "WhatsApp number",
        },
        {
          name: "emergencyNumber",
          label: "Emergency number",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
        },

        {
          type: "section",
          label: "Images",
        },
        {
          name: "logo",
          label: "Clinic logo",
          type: "image",
        },
        {
          name: "coverImage",
          label: "Cover image",
          type: "image",
        },
        {
          name: "images",
          label: "Clinic gallery",
          type: "images",
          maxFiles: 10,
          full: true,
        },

        {
          type: "section",
          label: "Display settings",
        },
        {
          name: "order",
          label: "Display order",
          type: "number",
          min: 0,
        },
        {
          name: "isFeatured",
          label: "Featured clinic",
          type: "switch",
        },

        {
          type: "section",
          label: "Specialities",
        },
        {
          name: "specialities",
          label: "Specialities offered",
          type: "multiselect",
          optionsFrom: "specialities",
        },

        {
          type: "section",
          label: "Address",
        },
        {
          name: "address.line1",
          label: "Address line 1",
        },
        {
          name: "address.line2",
          label: "Address line 2",
        },
        {
          name: "address.landmark",
          label: "Landmark",
        },
        {
          name: "address.city",
          label: "City",
        },
        {
          name: "address.state",
          label: "State",
        },
        {
          name: "address.pincode",
          label: "PIN code",
        },
        {
          name: "address.country",
          label: "Country",
        },
        {
          name: "mapLink",
          label: "Google Maps link",
          full: true,
          placeholder: "https://maps.google.com/...",
        },

        {
          type: "section",
          label: "Map location",
          help: "Coordinates are stored as longitude first, then latitude.",
        },
        {
          name: "location.coordinates.0",
          label: "Longitude",
          type: "number",
          placeholder: "77.2090",
        },
        {
          name: "location.coordinates.1",
          label: "Latitude",
          type: "number",
          placeholder: "28.6139",
        },

        {
          type: "section",
          label: "Opening hours",
        },
        {
          name: "timings.openTime",
          label: "Opens at",
          type: "time",
        },
        {
          name: "timings.closeTime",
          label: "Closes at",
          type: "time",
        },
        {
          name: "timings.workingDays",
          label: "Working days",
          type: "days",
        },

        {
          type: "section",
          label: "Appointment settings",
        },
        {
          name: "appointmentSettings.enabled",
          label: "Appointments enabled",
          type: "switch",
        },
        {
          name: "appointmentSettings.slotDuration",
          label: "Slot duration (minutes)",
          type: "number",
          min: 5,
        },
        {
          name: "appointmentSettings.bufferTime",
          label: "Buffer time (minutes)",
          type: "number",
          min: 0,
        },
        {
          name: "appointmentSettings.advanceBookingDays",
          label: "Advance booking days",
          type: "number",
          min: 0,
        },
        {
          name: "appointmentSettings.sameDayBooking",
          label: "Allow same-day booking",
          type: "switch",
        },
        {
          name: "appointmentSettings.allowOnlineBooking",
          label: "Allow online booking",
          type: "switch",
        },
        {
          name: "appointmentSettings.allowWalkIn",
          label: "Allow walk-ins",
          type: "switch",
        },

        {
          type: "section",
          label: "Facilities",
        },
        {
          name: "facilities",
          label: "Clinic facilities",
          type: "tags",
          placeholder:
            "Parking, Pharmacy, Laboratory, Wheelchair Access, Waiting Area",
          full: true,
          help: "Enter facilities separated by commas.",
        },

        {
          type: "section",
          label: "Payment methods",
        },
        {
          name: "paymentMethods",
          label: "Accepted payment methods",
          type: "multiselect",
          options: [
            {
              value: "cash",
              label: "Cash",
            },
            {
              value: "card",
              label: "Card",
            },
            {
              value: "upi",
              label: "UPI",
            },
            {
              value: "online",
              label: "Online",
            },
            {
              value: "insurance",
              label: "Insurance",
            },
          ],
        },

        {
          type: "section",
          label: "Clinic availability",
        },
        {
          name: "timezone",
          label: "Timezone",
          placeholder: "Asia/Kolkata",
        },
        {
          name: "isActive",
          label: "Listed on the website",
          type: "switch",
        },
        {
          name: "isTemporarilyClosed",
          label: "Temporarily closed",
          type: "switch",
        },
        {
          name: "temporaryClosureReason",
          label: "Temporary closure reason",
          type: "textarea",
          rows: 2,
          full: true,
        },

        {
          type: "section",
          label: "Search engine listing",
        },
        {
          name: "seo.metaTitle",
          label: "Meta title",
        },
        {
          name: "seo.metaDescription",
          label: "Meta description",
          type: "textarea",
          rows: 2,
          full: true,
        },
        {
          name: "seo.ogImage",
          label: "Share image",
          type: "image",
        },
      ]}
      deleteLabel="Deactivate"
    />
  );
}