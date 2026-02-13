import prisma from '../../config/database';

interface GetHospitalsFilters {
    city?: string;
    hospitalType?: string;
    search?: string;
    latitude?: string;
    longitude?: string;
    radius?: string; // in km
}

export class HospitalsService {
    async getHospitals(filters: GetHospitalsFilters) {
        const where: any = { is_verified: true };

        if (filters.city) {
            where.city = { contains: filters.city };
        }

        if (filters.hospitalType) {
            where.hospital_type = filters.hospitalType;
        }

        if (filters.search) {
            where.OR = [
                { hospital_name: { contains: filters.search } },
                { address: { contains: filters.search } },
                { city: { contains: filters.search } },
            ];
        }

        const hospitals = await prisma.hospital.findMany({
            where,
            orderBy: { rating: 'desc' },
        });

        // If latitude and longitude provided, calculate distance
        if (filters.latitude && filters.longitude) {
            const userLat = parseFloat(filters.latitude);
            const userLon = parseFloat(filters.longitude);
            const radius = filters.radius ? parseFloat(filters.radius) : 50; // default 50km

            const hospitalsWithDistance = hospitals
                .map(hospital => {
                    if (hospital.latitude && hospital.longitude) {
                        const distance = this.calculateDistance(
                            userLat,
                            userLon,
                            hospital.latitude,
                            hospital.longitude
                        );
                        return { ...hospital, distance };
                    }
                    return { ...hospital, distance: null };
                })
                .filter(h => h.distance === null || h.distance <= radius)
                .sort((a, b) => {
                    if (a.distance === null) return 1;
                    if (b.distance === null) return -1;
                    return a.distance - b.distance;
                });

            return hospitalsWithDistance;
        }

        return hospitals;
    }

    async getHospitalById(hospitalId: number) {
        const hospital = await prisma.hospital.findUnique({
            where: { hospital_id: hospitalId },
        });

        return hospital;
    }

    // Haversine formula to calculate distance between two coordinates
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

export const hospitalsService = new HospitalsService();
