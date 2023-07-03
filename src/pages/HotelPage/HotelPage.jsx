import { Link } from "react-router-dom";
import { routes } from "../../routes";
import { useQuery } from "@tanstack/react-query";
import { axiosJWT, axiosPost, url } from "../../utils/httpRequest";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken, selectRefreshToken, selectUser } from "../../redux/selectors";
import { toast } from "react-toastify";

const categories = [
	{ id: 1, name: "Hotel", hotels: null },
	{ id: 2, name: "Motel", hotels: null },
	{ id: 3, name: "HomeStay", hotels: null },
	{ id: 4, name: "Resort", hotels: null },
];

export default function HotelPage() {
	const currentUser = useSelector(selectUser);
	const accessToken = useSelector(selectAccessToken);
	const refreshToken = useSelector(selectRefreshToken);
	const dispatch = useDispatch();
	const listHotelState = useQuery({
		queryKey: ["hotel", currentUser],
		queryFn: async () => {
			const axiosJwt = axiosJWT(accessToken, refreshToken, dispatch);
			try {
				const res = await axiosJwt.get(url.hotel, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				return res;
			} catch (error) {
				console.log(error);
				return Promise.reject(error);
			}
		},
		staleTime: 3 * 60 * 1000,
	});
	let listHotel = [];
	if (listHotelState.isSuccess && listHotelState.data.data.success) {
		listHotel = listHotelState.data.data.hotels;
	}
	const handleDelete = async (id) => {
		if (confirm("Bạn có muốn xóa không?") == true) {
			const toastId = toast.loading("Đang xử lý!");
			const axiosJwt = axiosJWT(accessToken, refreshToken, dispatch);
			try {
				const res = await axiosJwt.delete(url.deleteHotel + "/" + id, {
					headers: {
						Authorization: "Bearer " + accessToken,
					},
				});
				console.log(res);
				toast.update(toastId, {
					render: "Xóa thành công!",
					type: "success",
					closeButton: true,
					autoClose: 1000,
					isLoading: false,
				});
			} catch (error) {
				console.log(error);
				toast.update(toastId, {
					render: "Không thể xóa!",
					type: "error",
					closeButton: true,
					autoClose: 1000,
					isLoading: false,
				});
			}
		}
	};
	return (
		<div className="bg-light rounded h-100 p-4">
			<div className="mb-4 d-flex justify-content-between align-items-center">
				<h6 className="mb-0">Danh sách khách sạn</h6>
				<Link to={routes.createHotel} className="btn btn-outline-primary">
					Thêm khách sạn
				</Link>
			</div>
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Tên khách sạn</th>
							<th scope="col">Số sao</th>
							<th scope="col">Loại</th>
							<th scope="col">Chi tiết</th>
							<th scope="col">Phòng</th>
							<th scope="col">Đơn đặt phòng</th>
							<th scope="col">Xóa/Hủy</th>
						</tr>
					</thead>
					<tbody>
						{listHotel.length > 0
							? listHotel.map((hotel, index) => (
									<tr key={hotel.id} className="align-middle">
										<th scope="row">{index + 1}</th>
										<td>{hotel.name}</td>
										<td>{hotel.star}</td>
										<td>
											{
												categories.find((category) => {
													return category.id === hotel.hotelCategoryId;
												}).name
											}
										</td>
										<td>
											<Link to={routes.hotel + "/" + hotel.id} className="btn btn-outline-primary">
												Xem
											</Link>
										</td>
										<td>
											<Link to={routes.hotel + "/" + hotel.id + "/room"} className="btn btn-outline-primary">
												Xem
											</Link>
										</td>
										<td>
											<Link to={routes.hotel + "/" + hotel.id + "/booking"} className="btn btn-outline-primary">
												Xem
											</Link>
										</td>
										<td>
											<button
												type="button"
												onClick={() => {
													handleDelete(hotel.id);
												}}
												className="btn btn-danger">
												Xóa
											</button>
										</td>
									</tr>
							  ))
							: null}
					</tbody>
				</table>
			</div>
		</div>
	);
}
