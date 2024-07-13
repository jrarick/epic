import { type User } from '@prisma/client'
import { prisma } from '#app/utils/db.server.ts'

export async function updateUserById(id: User['id'], data: Partial<User>) {
	return prisma.user.update({
		where: { id },
		data,
	})
}

export async function deleteUserById(id: User['id']) {
	return prisma.user.delete({ where: { id } })
}

export async function getUsers() {
	return prisma.user.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			createdAt: true,
			roles: true,
		},
	})
}

export async function addAdminRole(userId: User['id']) {
	return prisma.user.update({
		where: { id: userId },
		data: {
			roles: {
				connect: { name: 'admin' },
			},
		},
	})
}

export async function removeAdminRole(userId: User['id']) {
	return prisma.user.update({
		where: { id: userId },
		data: {
			roles: {
				disconnect: { name: 'admin' },
			},
		},
	})
}
