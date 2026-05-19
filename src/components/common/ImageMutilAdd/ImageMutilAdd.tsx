import { memo, useEffect, useState } from "react";
import { toastError, toastWarn } from "~/common/func/toast";

import { AddCircle } from "iconsax-react";
import { FaCamera } from "react-icons/fa";
import GridColumn from "../GridColumn";
import ImageCustom from "../ImageCustom";
import { IoClose } from "react-icons/io5";
import { PropsImageMutilAdd } from "./interfaces";
import styles from "./ImageMutilAdd.module.scss";

function ImageMutilAdd({ form, setForm, name, readonly }: PropsImageMutilAdd) {
	const [images, setImages] = useState<any>([])

	const handleFileChange = (event: any) => {
		const files = event.target.files;
		const newImages: any = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const { size, type } = file;
			const maxSize = 10; //MB
			if (size / 1000000 > maxSize) {
				toastError({ msg: "Kích thước tối đa của ảnh là ${ maxSize } mb" });
				return;
			} else if (
				type !== 'image/jpeg' &&
				type !== 'image/jpg' &&
				type !== 'image/png'
			) {
				toastWarn({
					msg: "Định dạng tệp không chính xác, đuôi tệp chấp nhận .jpg, .jpeg, .png",
				});
				return;
			}
			const url = URL.createObjectURL(file);
			newImages.push({ url, file });
		}
		setImages((prevImages: any) => [...prevImages, ...newImages])
	};

	const handleDelete = (index: number) => {
		setImages((prevImages: any) => {
			URL.revokeObjectURL(prevImages[index].url);
			return [
				...prevImages.slice(0, index),
				...prevImages.slice(index + 1),
			];
		});
	}
	useEffect(() => {
		setForm((prev: any) => ({ ...prev, [name]: [...images] }));
	}, [images, name, setForm])


	useEffect(() => {
		if (typeof form?.[name] == "string") {
			setImages(() => form?.[name]);
		}
	}, [form, name]);

	return <div className={styles.files}>
		<GridColumn col_12>
			<label className={styles.add}>
				<FaCamera color='#8496AC' />
				<input
					hidden
					type='file'
					multiple
					onClick={(e: any) => {
						e.target.value = null;
					}}
					onChange={handleFileChange}
				/>
			</label>
			{
				images.map((image: any, index: any) => (
					<div
						className={styles.box_image}
						key={image.url}
					>
						<ImageCustom
							className={styles.image}
							src={image.url}
							alt='image'
						/>
						<div
							className={styles.delete}
							onClick={() => handleDelete(index)}
						>
							<IoClose size={14} color='#8496AC' />
						</div>
					</div>
				))
			}
		</GridColumn>
	</div>
}

export default memo(ImageMutilAdd);
