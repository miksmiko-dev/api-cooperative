import { OmitType, PartialType } from '@nestjs/mapped-types';
import { MemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(
  OmitType(MemberDto, ['password']),
) {}
