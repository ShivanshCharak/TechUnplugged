import Delete from '../assets/delete.svg';

export default function BreadCrumbs() {
  return (
    <div className='flex w-full items-center py-4 '>
      {/* Left section - Utilities */}
      {/* Middle section - Breadcrumbs */}
      <div className='flex-1 flex justify-between items-center px-6'>
        <div className="flex items-center gap-2 text-sm text-purple-300">
          <a href="/" className="hover:text-purple-200 transition font-semibold">Home</a>
          <span className="text-gray-500">{'>'}</span>
          <a href="/blogs" className="hover:text-purple-200 transition font-semibold">Blog</a>
          <span className="text-gray-500 font-semibold">{'>'}</span>
          <span className="text-gray-400 font-semibold">Glassmorphism</span>
        </div>

        {/* Delete button */}
        <div className='flex items-center gap-2 bg-[#191b1e] p-2 rounded-lg cursor-pointer duration-200 ease-in hover:bg-white hover:text-black'>
          <img className='w-[17px]' src={Delete} alt="Delete icon" />
          <span className='text-xs font-semibold'>Delete Draft</span>
        </div>
      </div>
    </div>
  );
}
