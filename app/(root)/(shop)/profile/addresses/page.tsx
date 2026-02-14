import { getAddresses } from "@/lib/server actions/addresses.action";
import { MapPin, Phone, Home, Star } from "lucide-react";
import DataRenderer from "@/components/DataRenderer";
import SetDefaultAddressBtn from "@/components/buttons/SetDefaultAddressBtn";
import AddAddressForm from "@/components/forms/AddAddressForm";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";
import * as motion from "motion/react-client";

export const metadata: Metadata = {
  title: "Activo Store | Addresses",
  description:
    "Manage your delivery addresses. Add, edit, or set default shipping addresses for your Activo Store orders.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://activo-store.vercel.app.com/addresses",
  },
};

export default function AddressesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AddressesPageContent />
    </Suspense>
  );
}

async function AddressesPageContent() {
  const { success, data, error } = await getAddresses();

  return (
    <motion.div
      className="mb-5 rounded-2xl bg-linear-to-br from-neutral-100 to-neutral-200 py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="self-start">
            <h1 className="h2-bold text-neutral-900">My Addresses</h1>
            <p className="body-medium text-neutral-700 mb-3">
              Manage your delivery addresses
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <AddAddressForm toggleBtn={true} />
          </motion.div>
        </motion.div>

        <DataRenderer
          success={success}
          data={data}
          error={error}
          empty={{
            title: "No Addresses Yet",
            message:
              "Add your first delivery address to get started with your orders",
            button: {
              text: "Add New Address",
              href: "/addresses/new",
            },
          }}
          render={(addresses) => (
            <div className="space-y-4">
              {addresses?.map((address, index) => (
                <motion.div
                  key={address._id?.toString() || index}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-2 ${
                    address.isDefault
                      ? "border-primary-500"
                      : "border-slate-200 hover:border-slate-300"
                  } overflow-hidden`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* City */}
                      <motion.div
                        className="flex-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Home className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary uppercase tracking-wide mb-1">
                            City
                          </p>
                          <p className="text-primary font-semibold capitalize truncate">
                            {address.city}
                          </p>
                        </div>
                      </motion.div>

                      {/* Details */}
                      <motion.div
                        className="flex-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary uppercase tracking-wide mb-1">
                            Address
                          </p>
                          <p className="text-primary text-sm leading-relaxed line-clamp-2">
                            {address.details}
                          </p>
                        </div>
                      </motion.div>

                      {/* Phone */}
                      <motion.div
                        className="flex-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary uppercase tracking-wide mb-1">
                            Phone
                          </p>
                          <p className="text-primary font-mono font-semibold truncate">
                            {address.phone}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      className="shrink-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
                    >
                      {!address.isDefault ? (
                        <SetDefaultAddressBtn
                          addressId={address._id?.toString() || ""}
                        />
                      ) : (
                        <div className="flex-1 px-4 py-2 body-medium rounded-lg bg-primary-gradient hover:bg-primary/90 active:bg-primary/80 text-white transition-all duration-300 shadow-md hover:shadow-lg flex-center gap-2">
                          <Star className="w-5 h-5 text-white fill-white" />
                          <span className="text-white body-medium font-semibold">
                            Default
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        />
      </div>
    </motion.div>
  );
}